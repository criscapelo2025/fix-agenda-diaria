import base64
import os

with open('PROFORMA_FORMATO.docx', 'rb') as f:
    docx_base64 = base64.b64encode(f.read()).decode('utf-8')

header_code = 'window.PROFORMA_DOCX_BASE64 = "' + docx_base64 + '";\n'

with open('proformas_logic.js', 'r', encoding='utf-8') as f:
    logic_code = f.read()

with open('proformas.js', 'w', encoding='utf-8') as f:
    f.write(header_code + logic_code)

print('proformas.js generated! Size:', os.path.getsize('proformas.js'))
