import os
import glob
import json
import sqlite3
import pandas as pd
import numpy as np

def clean_date(val):
    if pd.isna(val) or val is None:
        return ""
    if isinstance(val, pd.Timestamp):
        return val.strftime("%Y-%m-%d")
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ["nan", "nat", "null", "sap", "n/a", "-"]:
        return ""
    try:
        # Check if it looks like a number (excel serial date)
        if val_str.replace(".", "", 1).isdigit() and len(val_str) > 4:
            dt = pd.to_datetime(float(val_str), unit='D', origin='1899-12-30', errors='coerce')
            if pd.notna(dt):
                return dt.strftime("%Y-%m-%d")
        
        dt = pd.to_datetime(val_str, errors='coerce')
        if pd.notna(dt):
            return dt.strftime("%Y-%m-%d")
    except:
        pass
    
    import re
    if re.match(r'^\d{4}-\d{2}-\d{2}', val_str):
        return val_str[:10]
        
    return ""

def clean_tecnico(val):
    s = clean_str(val)
    if not s:
        return ""
    s_upper = s.upper().replace(".", "").strip()
    if s_upper in ["CAPELO", "CRISTIAN CAPELO", "C CAPELO", "TECNICO CRISTIAN CAPELO"]:
        return "CRISTIAN CAPELO"
    return s_upper

def clean_str(val):
    if pd.isna(val) or val is None:
        return ""
    val_str = str(val).strip()
    if val_str.lower() in ["nan", "null", "sap", "n/a", "-"]:
        return ""
    return val_str

def clean_invoice(val):
    s = clean_str(val)
    if not s:
        return ""
    # Remove leading/trailing non-alphanumeric except dashes or slashes
    return s.upper()

def clean_email(val):
    s = clean_str(val)
    if not s:
        return ""
    return s.lower()

def clean_client(val):
    s = clean_str(val)
    if not s:
        return ""
    # Title case names
    return s.title()

def clean_code_serie(val):
    s = clean_str(val)
    if not s:
        return ""
    # Remove decimals if float like 40466111.0 -> 40466111
    if s.endswith(".0"):
        s = s[:-2]
    return s.upper().replace(" ", "")

def consolidate_data():
    base_dir = "/Users/olivercapelo/Desktop/Copia de REPORTES 2026"
    db_path = os.path.join(base_dir, "reportes.db")
    
    excel_files = glob.glob(os.path.join(base_dir, "**/*.xlsx"), recursive=True) + \
                  glob.glob(os.path.join(base_dir, "**/*.xlsm"), recursive=True)
                  
    keywords = ["fecha", "serie", "codigo", "código", "cliente", "correo", "factura", "nombre"]
    
    # Mapping dictionary: standard column name -> list of aliases (lowercase)
    mapping_rules = {
        "fecha": ["fecha de compra", "fecha de compra ", "fecha de intervención", "fecha de visita", "fecha de instalación", "fecha", "compra"],
        "factura": ["factura numero", "numero de factura de compra", "numero de factura de", "factura numero ", "numero de factura de ", "factura", "n. factura", "n° factura", "num. factura", "num factura"],
        "serie": ["serie del equipo", "serie del equipo ", "serie", "serie ", "n. serie", "n° serie", "num. serie", "num serie"],
        "codigo": ["codigo del producto", "código del producto", "código del producto ", "codigo del producto ", "código", "código ", "cód. artículo", "código del repuesto", "codigo", "cód artículo", "cod. articulo", "cod articulo"],
        "cliente": ["nombre del cliente", "cliente", "nombre", "nombre ", "nombre del cliente ", "cliente ", "nombre cliente", "nombres", "usuario"],
        "correo": ["correo del cliente", "correo del cliente ", "correo", "correo ", "email", "e-mail", "mail"],
        "telefono": ["celular del cliente", "celular", "teléfono", "telefono", "teléfono del cliente", "telefono del cliente", "celular ", "teléfono ", "telefono ", "contacto"],
        "direccion": ["dirección", "direccion", "direccion instalacion", "dirección instalacion", "dirección de instalación", "direccion de instalacion", "dirección del cliente", "direccion del cliente"],
        "descripcion": ["descripcion de producto", "descripción de producto", "descripcion de producto ", "descripción de producto ", "descripcion", "descripción", "descripción del producto", "descripcion del producto", "producto"],
        "tecnico": ["tecnico", "técnico", "tecnico ", "técnico ", "técnico que atendió", "tecnico que atendio", "tecnico que atendió"],
        "precio": ["precio", "valor", "vr.", "vr", "costo", "valor a pagar", "valor a pagar "],
        "ciudad": ["ciudad", "provincia", "lugar"],
        "estado": ["estado", "situacion", "situación"],
        "observaciones": ["observaciones", "observación", "observacion", "observaciones ", "nota", "notas"]
    }
    
    all_records = []
    
    for file in excel_files:
        if "~$" in file:
            continue
        rel_path = os.path.relpath(file, base_dir)
        print(f"Processing: {rel_path}")
        try:
            xl = pd.ExcelFile(file)
            for sheet in xl.sheet_names:
                df_raw = pd.read_excel(file, sheet_name=sheet, nrows=25, header=None)
                if df_raw.empty:
                    continue
                
                # Detect header row
                best_row = -1
                max_matches = 0
                for idx, row in df_raw.iterrows():
                    row_str = [str(val).lower() for val in row.values if pd.notna(val)]
                    matches = sum(1 for kw in keywords if any(kw in str_val for str_val in row_str))
                    if matches > max_matches:
                        max_matches = matches
                        best_row = idx
                
                # Check if it has enough keyword matches (at least 3 keywords, or 2 for small sheets)
                if max_matches < 3:
                    continue
                
                # Load sheet starting from the header row
                df_sheet = pd.read_excel(file, sheet_name=sheet, skiprows=best_row)
                df_sheet = df_sheet.dropna(how='all')
                
                # Clean columns names
                cols = [str(c).strip() for c in df_sheet.columns]
                df_sheet.columns = cols
                
                # Determine mapping: standard_col -> sheet_col
                mapping = {}
                for std_col, aliases in mapping_rules.items():
                    for alias in aliases:
                        # Exact match case-insensitive
                        matched_col = None
                        for c in cols:
                            if c.lower() == alias:
                                matched_col = c
                                break
                        if matched_col:
                            mapping[std_col] = matched_col
                            break
                        
                        # Fuzzy match: starts with/ends with
                        for c in cols:
                            if alias in c.lower():
                                matched_col = c
                                break
                        if matched_col:
                            mapping[std_col] = matched_col
                            break
                
                # Extract records
                for idx, row in df_sheet.iterrows():
                    record = {
                        "archivo_origen": rel_path,
                        "hoja_origen": sheet,
                        "fila_origen": int(idx + best_row + 2), # Excel is 1-indexed and we skipped header
                    }
                    
                    # Check if the row has any data
                    has_data = False
                    row_data = {}
                    for col in cols:
                        val = row[col]
                        # Handle duplicate columns where pandas returns a Series
                        if isinstance(val, pd.Series):
                            val = val.iloc[0]
                        if pd.notna(val):
                            row_data[col] = str(val)
                            
                    if not row_data:
                        continue
                        
                    # Standard fields
                    for std_col in mapping_rules.keys():
                        sheet_col = mapping.get(std_col)
                        val = None
                        if sheet_col:
                            val = row[sheet_col]
                            if isinstance(val, pd.Series):
                                val = val.iloc[0]
                        
                        if sheet_col and pd.notna(val):
                            record[std_col] = val
                            has_data = True
                        else:
                            record[std_col] = None
                            
                    if not has_data:
                        continue
                        
                    # Full details
                    record["datos_completos"] = json.dumps(row_data, default=str, ensure_ascii=False)
                    all_records.append(record)
                    
        except Exception as e:
            print(f"Error reading {rel_path} sheet {sheet}: {e}")
            
    print(f"\nExtracted {len(all_records)} raw records.")
    
    # Create DataFrame
    df_all = pd.DataFrame(all_records)
    
    # Apply cleaning
    df_all["fecha"] = df_all["fecha"].apply(clean_date)
    df_all["factura"] = df_all["factura"].apply(clean_invoice)
    df_all["serie"] = df_all["serie"].apply(clean_code_serie)
    df_all["codigo"] = df_all["codigo"].apply(clean_code_serie)
    df_all["cliente"] = df_all["cliente"].apply(clean_client)
    df_all["correo"] = df_all["correo"].apply(clean_email)
    df_all["telefono"] = df_all["telefono"].apply(clean_str)
    df_all["direccion"] = df_all["direccion"].apply(clean_str)
    df_all["descripcion"] = df_all["descripcion"].apply(clean_str)
    df_all["tecnico"] = df_all["tecnico"].apply(clean_tecnico)
    df_all["precio"] = df_all["precio"].apply(clean_str)
    df_all["ciudad"] = df_all["ciudad"].apply(clean_str)
    df_all["estado"] = df_all["estado"].apply(clean_str)
    df_all["observaciones"] = df_all["observaciones"].apply(clean_str)
    
    # Let's perform deduplication
    # We want to identify duplicates on key fields: fecha, cliente, serie, codigo, correo, descripcion
    # But wait, we should normalize them for comparison (e.g. lowercase, remove spaces)
    df_all["cmp_fecha"] = df_all["fecha"]
    df_all["cmp_cliente"] = df_all["cliente"].str.lower().str.replace(" ", "")
    df_all["cmp_serie"] = df_all["serie"]
    df_all["cmp_codigo"] = df_all["codigo"]
    df_all["cmp_correo"] = df_all["correo"]
    df_all["cmp_descripcion"] = df_all["descripcion"].str.lower().str.replace(" ", "")
    
    # Let's define the duplication key
    dup_cols = ["cmp_fecha", "cmp_cliente", "cmp_serie", "cmp_codigo", "cmp_correo", "cmp_descripcion"]
    
    # To choose the best record in case of duplicates:
    # We prefer records that have:
    # 1. Non-empty 'factura'
    # 2. Sheet name is NOT 'CONSOLIDADO' (since individual sheets have invoice numbers)
    # Let's calculate a completeness score
    def get_score(row):
        score = 0
        if row["factura"]:
            score += 10
        if "consolidado" not in str(row["hoja_origen"]).lower():
            score += 5
        # Add number of populated fields
        for col in ["telefono", "direccion", "tecnico", "precio", "ciudad", "estado", "observaciones"]:
            if row[col]:
                score += 1
        return score
        
    df_all["score"] = df_all.apply(get_score, axis=1)
    
    # Sort by score descending so the best record is first
    df_all = df_all.sort_values(by="score", ascending=False)
    
    # Drop duplicates keeping the first (best score)
    df_clean = df_all.drop_duplicates(subset=dup_cols, keep="first")
    
    # Remove comparison and temporary columns
    df_clean = df_clean.drop(columns=dup_cols + ["score"])
    
    print(f"Cleaned and deduplicated to {len(df_clean)} records.")
    
    # Write to SQLite
    conn = sqlite3.connect(db_path)
    # Drop table if exists
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS reportes")
    conn.commit()
    
    df_clean.to_sql("reportes", conn, index=False)
    conn.close()
    
    print("Database created and saved to reportes.db")

if __name__ == "__main__":
    consolidate_data()
