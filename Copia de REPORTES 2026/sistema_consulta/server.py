import http.server
import socketserver
import json
import sqlite3
import urllib.parse
import os
import sys

PORT = 8000
# Database path relative to this script (assumed to be in system_consulta/ and database in root)
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../reportes.db"))

class QueryHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == "/api/search":
            self.handle_search(url.query)
        elif url.path == "/api/stats":
            self.handle_stats()
        else:
            # Serve static files normally from current folder
            super().do_GET()
            
    def handle_search(self, query_string):
        params = urllib.parse.parse_qs(query_string)
        
        # Extract filters
        fecha = params.get("fecha", [""])[0].strip()
        factura = params.get("factura", [""])[0].strip()
        serie = params.get("serie", [""])[0].strip()
        codigo = params.get("codigo", [""])[0].strip()
        cliente = params.get("cliente", [""])[0].strip()
        correo = params.get("correo", [""])[0].strip()
        global_search = params.get("q", [""])[0].strip()
        
        limit = int(params.get("limit", [50])[0])
        offset = int(params.get("offset", [0])[0])
        
        sql = "SELECT * FROM reportes WHERE 1=1"
        sql_params = []
        
        if fecha:
            sql += " AND fecha LIKE ?"
            sql_params.append(f"%{fecha}%")
        if factura:
            sql += " AND factura LIKE ?"
            sql_params.append(f"%{factura}%")
        if serie:
            sql += " AND serie LIKE ?"
            sql_params.append(f"%{serie}%")
        if codigo:
            sql += " AND codigo LIKE ?"
            sql_params.append(f"%{codigo}%")
        if cliente:
            sql += " AND cliente LIKE ?"
            sql_params.append(f"%{cliente}%")
        if correo:
            sql += " AND correo LIKE ?"
            sql_params.append(f"%{correo}%")
            
        if global_search:
            sql += """ AND (
                fecha LIKE ? OR 
                factura LIKE ? OR 
                serie LIKE ? OR 
                codigo LIKE ? OR 
                cliente LIKE ? OR 
                correo LIKE ? OR 
                descripcion LIKE ? OR 
                observaciones LIKE ? OR 
                tecnico LIKE ? OR 
                ciudad LIKE ?
            )"""
            sql_params.extend([f"%{global_search}%"] * 10)
            
        # Count total matches
        count_sql = "SELECT COUNT(*) FROM (" + sql + ")"
        
        # Add order and limit/offset
        sql += " ORDER BY fecha DESC, cliente ASC LIMIT ? OFFSET ?"
        sql_params.extend([limit, offset])
        
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get total matching count
            cursor.execute(count_sql, sql_params[:-2])
            total_matches = cursor.fetchone()[0]
            
            # Get data rows
            cursor.execute(sql, sql_params)
            rows = cursor.fetchall()
            
            data = []
            for r in rows:
                d = dict(r)
                # Parse JSON if valid
                try:
                    d["datos_completos"] = json.loads(d["datos_completos"])
                except:
                    pass
                data.append(d)
                
            conn.close()
            
            # Send response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            
            res = {
                "success": True,
                "total": total_matches,
                "limit": limit,
                "offset": offset,
                "results": data
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode("utf-8"))
            
        except Exception as e:
            self.send_error_response(str(e))

    def handle_stats(self):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Total records
            cursor.execute("SELECT COUNT(*) FROM reportes")
            total_records = cursor.fetchone()[0]
            
            # Records by year
            cursor.execute("""
                SELECT SUBSTR(fecha, 1, 4) as year, COUNT(*) 
                FROM reportes 
                WHERE fecha IS NOT NULL 
                  AND length(fecha) >= 4 
                  AND SUBSTR(fecha, 1, 4) GLOB '[12][0-9][0-9][0-9]'
                GROUP BY year 
                ORDER BY year DESC
            """)
            by_year = [{"year": r[0], "count": r[1]} for r in cursor.fetchall()]
            
            # Top 5 Technicians
            cursor.execute("""
                SELECT tecnico, COUNT(*) 
                FROM reportes 
                WHERE tecnico IS NOT NULL AND tecnico != ''
                GROUP BY tecnico 
                ORDER BY COUNT(*) DESC 
                LIMIT 5
            """)
            top_tecnicos = [{"tecnico": r[0], "count": r[1]} for r in cursor.fetchall()]

            # Top 5 Products / Codes
            cursor.execute("""
                SELECT codigo, descripcion, COUNT(*) 
                FROM reportes 
                WHERE codigo IS NOT NULL AND codigo != ''
                GROUP BY codigo 
                ORDER BY COUNT(*) DESC 
                LIMIT 5
            """)
            top_productos = []
            for r in cursor.fetchall():
                desc = r[1]
                if not desc:
                    desc = "Código " + str(r[0])
                top_productos.append({"codigo": r[0], "descripcion": desc, "count": r[2]})
            
            conn.close()
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            
            res = {
                "success": True,
                "stats": {
                    "total_records": total_records,
                    "by_year": by_year,
                    "top_tecnicos": top_tecnicos,
                    "top_productos": top_productos
                }
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode("utf-8"))
            
        except Exception as e:
            self.send_error_response(str(e))
            
    def send_error_response(self, error_msg):
        self.send_response(500)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"success": False, "error": error_msg}).encode("utf-8"))

def run():
    # Make sure we change dir to the script's directory so it serves static files correctly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"Loading database from: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}. Please run consolidate.py first.")
        sys.exit(1)
        
    handler = QueryHandler
    # Enable socket re-use to avoid 'Address already in use' errors
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"\n==================================================")
        print(f"SISTEMA DE CONSULTA INICIADO")
        print(f"Servidor web corriendo en: http://localhost:{PORT}")
        print(f"Presiona Ctrl+C en la terminal para apagar el servidor.")
        print(f"==================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nApagando el servidor...")
            sys.exit(0)

if __name__ == "__main__":
    run()
