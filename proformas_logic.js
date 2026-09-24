/**
 * ============================================================================
 * MÓDULO OFICIAL DE PROFORMAS Y COTIZACIONES FIX
 * Generación con fidelidad 100% al formato oficial (Hoja Membretada FIX)
 * Integrado con Catálogo Oficial TEKA, cálculo automático de IVA y exportación
 * ============================================================================
 */

// Array global en memoria de proformas
window.proformasArray = [];
window.currentProforma = null;
window.proformaPickerRowIndex = null;
window.proformaActiveTab = 'editor'; // 'editor' | 'preview'

// Utilidad decodificar base64 a Uint8Array
function proformaB64ToUint8(base64) {
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

// Utilidad escapar XML
function proformaXmlEscape(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Limpiar nombres para archivos
function proformaSanitizeFileName(str) {
    if (!str) return 'CLIENTE';
    return String(str)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .toUpperCase();
}

// Formatear moneda
function formatMoney(num) {
    const n = Number(num) || 0;
    return n.toFixed(2);
}

// Obtener fecha en español
function getProformaFechaTexto(dateStr) {
    let d;
    if (!dateStr) {
        d = new Date();
    } else {
        const parts = String(dateStr).split('-');
        if (parts.length === 3) {
            d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
            d = new Date(dateStr);
        }
    }
    if (isNaN(d.getTime())) d = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// Obtener fecha YYYY-MM-DD
function getProformaTodayISO() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generar nuevo correlativo
function generateNextProformaNumber() {
    const year = new Date().getFullYear();
    const count = (window.proformasArray || []).length + 1;
    return `PRO-${year}-${String(count).padStart(3, '0')}`;
}

// ============================================================================
// 1. INICIALIZAR Y GESTIONAR PROFORMA ACTUAL
// ============================================================================
window.initNewProforma = function(clientData) {
    const todayISO = getProformaTodayISO();
    window.currentProforma = {
        id: 'prof_' + Date.now(),
        numero: generateNextProformaNumber(),
        fecha: todayISO,
        fechaTexto: getProformaFechaTexto(todayISO),
        cliente: clientData && clientData.nombre ? clientData.nombre.toUpperCase() : '',
        ruc: clientData && clientData.cedulaRuc ? clientData.cedulaRuc : '',
        telefono: clientData && clientData.telefono ? clientData.telefono : '',
        introTexto: 'Estimado cliente, se nos ha solicitado valorar costo de repuestos y servicio técnico:',
        items: [
            { cant: 1, codigo: '', desc: '', unit: 0, total: 0 }
        ],
        ivaRate: 15,
        aplicaIva: true,
        subtotal: 0,
        iva: 0,
        total: 0,
        validezDias: 15,
        emisor: 'Cristian Capelo',
        telefonoEmisor: '0969528406',
        estado: 'Borrador',
        createdAt: new Date().toISOString()
    };
    window.calcProformaTotals();
    window.renderProformaModule();
};

window.calcProformaTotals = function() {
    if (!window.currentProforma) return;
    let subtotal = 0;
    (window.currentProforma.items || []).forEach(item => {
        const cant = Number(item.cant) || 1;
        const unit = Number(item.unit) || 0;
        item.total = Math.round(cant * unit * 100) / 100;
        subtotal += item.total;
    });
    subtotal = Math.round(subtotal * 100) / 100;
    window.currentProforma.subtotal = subtotal;

    if (window.currentProforma.aplicaIva) {
        const rate = (Number(window.currentProforma.ivaRate) || 15) / 100;
        window.currentProforma.iva = Math.round(subtotal * rate * 100) / 100;
    } else {
        window.currentProforma.iva = 0;
    }
    window.currentProforma.total = Math.round((window.currentProforma.subtotal + window.currentProforma.iva) * 100) / 100;
};

// ============================================================================
// 2. BUSCADOR Y AUTOCOMPLETADO DE REPUESTOS TEKA
// ============================================================================
window.searchRepuestoInCatalogs = function(codeQuery) {
    if (!codeQuery) return null;
    const clean = String(codeQuery).trim().toUpperCase();
    const repuestos = window.LISTA_REPUESTOS_TEKA || [];
    
    // Búsqueda exacta primero
    let exact = repuestos.find(r => r.cod && String(r.cod).trim().toUpperCase() === clean);
    if (exact) return exact;

    // Búsqueda en catálogo base de productos TEKA
    if (window.CATALOGO_TEKA_BASE && window.CATALOGO_TEKA_BASE[clean]) {
        return { cod: clean, desc: window.CATALOGO_TEKA_BASE[clean], precio: 0 };
    }

    return null;
};

window.getRepuestoSuggestions = function(query, limit = 8) {
    if (!query) return [];
    const clean = String(query).trim().toUpperCase();
    const repuestos = window.LISTA_REPUESTOS_TEKA || [];
    const results = [];
    
    // Coincidencias por código (prioridad alta)
    for (const r of repuestos) {
        if (r.cod && String(r.cod).toUpperCase().includes(clean)) {
            results.push(r);
            if (results.length >= limit) return results;
        }
    }
    // Coincidencias por descripción si aún hay cupo
    for (const r of repuestos) {
        if (!results.includes(r) && r.desc && r.desc.toUpperCase().includes(clean)) {
            results.push(r);
            if (results.length >= limit) return results;
        }
    }
    // Catálogo base de productos
    if (window.CATALOGO_TEKA_BASE) {
        for (const [k, v] of Object.entries(window.CATALOGO_TEKA_BASE)) {
            if (k.toUpperCase().includes(clean) || v.toUpperCase().includes(clean)) {
                results.push({ cod: k, desc: v, precio: 0 });
                if (results.length >= limit) return results;
            }
        }
    }
    return results;
};

// Manejar escritura en el campo código con autocompletado en tiempo real
window.handleProformaCodeInput = function(rowIndex, value) {
    if (!window.currentProforma || !window.currentProforma.items[rowIndex]) return;
    const item = window.currentProforma.items[rowIndex];
    item.codigo = value;

    const matched = window.searchRepuestoInCatalogs(value);
    if (matched) {
        item.desc = matched.desc || item.desc;
        if (matched.precio > 0 || !item.unit) {
            item.unit = matched.precio || 0;
        }
        window.calcProformaTotals();
        window.updateProformaRowDOM(rowIndex);
        window.updateProformaLiveSheetDOM();
        window.closeProformaDropdown(rowIndex);
        return;
    }

    // Desplegar sugerencias flotantes
    const suggestions = window.getRepuestoSuggestions(value, 6);
    const drop = document.getElementById(`proformaDropdown_${rowIndex}`);
    if (!drop) return;

    if (suggestions.length > 0 && value.trim().length >= 2) {
        drop.innerHTML = suggestions.map(s => `
            <div onclick="selectRepuestoForProformaRow(${rowIndex}, '${s.cod.replace(/'/g, "\\'")}', '${s.desc.replace(/'/g, "\\'")}', ${s.precio || 0})" class="p-2 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer border-b border-stone-100 dark:border-slate-600 flex items-center justify-between gap-2 text-xs transition-colors">
                <div class="min-w-0 flex-1">
                    <span class="font-mono font-bold text-sky-600 dark:text-sky-400">${s.cod}</span>
                    <span class="text-stone-700 dark:text-slate-200 ml-1.5 truncate block">${s.desc}</span>
                </div>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">$${Number(s.precio || 0).toFixed(2)}</span>
            </div>
        `).join('');
        drop.classList.remove('hidden');
    } else {
        drop.classList.add('hidden');
    }

    window.calcProformaTotals();
    window.updateProformaLiveSheetDOM();
};

window.closeProformaDropdown = function(rowIndex) {
    const drop = document.getElementById(`proformaDropdown_${rowIndex}`);
    if (drop) drop.classList.add('hidden');
};

window.selectRepuestoForProformaRow = function(rowIndex, cod, desc, precio) {
    if (!window.currentProforma || !window.currentProforma.items[rowIndex]) return;
    const item = window.currentProforma.items[rowIndex];
    item.codigo = cod;
    item.desc = desc;
    item.unit = Number(precio) || 0;
    item.total = Math.round((Number(item.cant) || 1) * item.unit * 100) / 100;
    
    window.calcProformaTotals();
    window.updateProformaRowDOM(rowIndex);
    window.updateProformaLiveSheetDOM();
    window.closeProformaDropdown(rowIndex);
};

// ============================================================================
// 3. AGREGAR, MODIFICAR Y ELIMINAR FILAS
// ============================================================================
window.addProformaRow = function(itemData = null) {
    if (!window.currentProforma) return;
    const newItem = itemData || { cant: 1, codigo: '', desc: '', unit: 0, total: 0 };
    window.currentProforma.items.push(newItem);
    window.calcProformaTotals();
    window.renderProformaEditor();
    window.updateProformaLiveSheetDOM();
};

window.addProformaServicioRow = function() {
    window.addProformaRow({
        cant: 1,
        codigo: 'SERV-MO',
        desc: 'MANO DE OBRA Y REVISIÓN TÉCNICA ESPECIALIZADA',
        unit: 25.00,
        total: 25.00
    });
};

window.removeProformaRow = function(index) {
    if (!window.currentProforma) return;
    if (window.currentProforma.items.length <= 1) {
        window.currentProforma.items[0] = { cant: 1, codigo: '', desc: '', unit: 0, total: 0 };
    } else {
        window.currentProforma.items.splice(index, 1);
    }
    window.calcProformaTotals();
    window.renderProformaEditor();
    window.updateProformaLiveSheetDOM();
};

window.updateProformaRowField = function(rowIndex, field, value) {
    if (!window.currentProforma || !window.currentProforma.items[rowIndex]) return;
    const item = window.currentProforma.items[rowIndex];
    if (field === 'cant') {
        item.cant = Math.max(1, parseFloat(value) || 1);
    } else if (field === 'unit') {
        item.unit = Math.max(0, parseFloat(value) || 0);
    } else if (field === 'desc') {
        item.desc = value.toUpperCase();
    }
    item.total = Math.round((Number(item.cant) || 1) * (Number(item.unit) || 0) * 100) / 100;
    window.calcProformaTotals();
    
    // Actualizar celda total en el DOM del editor
    const totalEl = document.getElementById(`proformaItemTotal_${rowIndex}`);
    if (totalEl) totalEl.innerText = `$${formatMoney(item.total)}`;
    
    window.updateProformaTotalsDOM();
    window.updateProformaLiveSheetDOM();
};

window.updateProformaHeaderField = function(field, value) {
    if (!window.currentProforma) return;
    window.currentProforma[field] = value;
    if (field === 'fecha') {
        window.currentProforma.fechaTexto = getProformaFechaTexto(value);
    }
    if (field === 'aplicaIva') {
        window.currentProforma.aplicaIva = Boolean(value);
        window.calcProformaTotals();
        window.updateProformaTotalsDOM();
    }
    window.updateProformaLiveSheetDOM();
};

// ============================================================================
// 4. GENERADOR OFICIAL DE WORD (.DOCX) EXACTO
// ============================================================================
window.buildWordZipProforma = async function(data) {
    if (typeof JSZip === 'undefined') {
        throw new Error('La librería JSZip no está disponible.');
    }
    const zip = await JSZip.loadAsync(proformaB64ToUint8(window.PROFORMA_DOCX_BASE64));
    let xml = await zip.file('word/document.xml').async('string');

    const numero = (data.numero || 'PRO-2026-001').toUpperCase();
    const fechaTexto = data.fechaTexto || getProformaFechaTexto(data.fecha || new Date());
    const cliente = (data.cliente || 'CLIENTE').toUpperCase();
    const ruc = (data.ruc || '').toUpperCase();
    const telefono = data.telefono || '';
    const introTexto = data.introTexto || 'Estimado cliente, se nos ha solicitado valorar costo de repuestos y servicio técnico:';
    const subtotalStr = formatMoney(data.subtotal || 0);
    const ivaStr = formatMoney(data.iva || 0);
    const totalStr = formatMoney(data.total || 0);
    const ivaRate = data.aplicaIva ? (data.ivaRate || 15) : 0;
    const validez = data.validezDias || 15;
    const emisor = data.emisor || 'Cristian Capelo';
    const telefonoEmisor = data.telefonoEmisor || '0969528406';

    // 1. Título PROFORMA
    if (numero) {
        xml = xml.replace('<w:t>PROFORMA</w:t>', `<w:t>PROFORMA - ${proformaXmlEscape(numero)}</w:t>`);
    }

    // 2. Fecha
    xml = xml.replace('<w:t>……………</w:t>', `<w:t>${proformaXmlEscape(fechaTexto)}</w:t>`);

    // 3. Cliente
    xml = xml.replace('<w:t>Cliente:</w:t>', `<w:t xml:space="preserve">Cliente: </w:t></w:r><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>${proformaXmlEscape(cliente)}</w:t>`);

    // 4. RUC y Teléfono
    const rucTelText = (ruc ? ruc : '') + (telefono ? `    Teléfono: ${telefono}` : '');
    xml = xml.replace('<w:t xml:space="preserve">RUC: </w:t>', `<w:t xml:space="preserve">RUC: ${proformaXmlEscape(rucTelText)}</w:t>`);

    // 5. Texto Introductorio
    const estimIdx = xml.indexOf('Estimado cliente');
    if (estimIdx !== -1) {
        const pStart = xml.lastIndexOf('<w:p ', estimIdx);
        const pEnd = xml.indexOf('</w:p>', estimIdx) + 6;
        if (pStart !== -1 && pEnd > pStart) {
            const newIntroP = `<w:p><w:pPr><w:ind w:left="-5"/><w:spacing w:after="120" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr><w:t xml:space="preserve">${proformaXmlEscape(introTexto)}</w:t></w:r></w:p>`;
            xml = xml.substring(0, pStart) + newIntroP + xml.substring(pEnd);
        }
    }

    // 6. Generar Filas Dinámicas de la Tabla
    const tblStart = xml.indexOf('<w:tbl');
    const tblEnd = xml.indexOf('</w:tbl>') + 8;
    if (tblStart !== -1 && tblEnd > tblStart) {
        const origTbl = xml.substring(tblStart, tblEnd);
        const tblPrEnd = origTbl.indexOf('</w:tblPr>') + 10;
        const tblPr = origTbl.substring(0, tblPrEnd);
        const tblGridEnd = origTbl.indexOf('</w:tblGrid>') + 12;
        const tblGrid = origTbl.substring(tblPrEnd, tblGridEnd);

        // Header row
        const trStart = origTbl.indexOf('<w:tr');
        const trEnd = origTbl.indexOf('</w:tr>') + 7;
        const headerTr = origTbl.substring(trStart, trEnd);

        // Filas para cada item
        const dataRowsXml = (data.items || []).map(it => {
            const itCant = proformaXmlEscape(it.cant || 1);
            const itCod = proformaXmlEscape(it.codigo || '---');
            const itDesc = proformaXmlEscape(it.desc || 'REPUESTO / SERVICIO');
            const itUnit = formatMoney(it.unit || 0);
            const itTotal = formatMoney(it.total || 0);

            return `<w:tr w:rsidR="00AD104A" w:rsidRPr="00EE4D87" w:rsidTr="004D1D5A">` +
                `<w:trPr><w:tblCellSpacing w:w="15" w:type="dxa"/></w:trPr>` +
                // Cantidad
                `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/></w:tcBorders><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/><w:hideMark/></w:tcPr>` +
                `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr><w:t>${itCant}</w:t></w:r></w:p></w:tc>` +
                // Código
                `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/></w:tcBorders><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/><w:hideMark/></w:tcPr>` +
                `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr><w:t>${itCod}</w:t></w:r></w:p></w:tc>` +
                // Descripción
                `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/></w:tcBorders><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/><w:hideMark/></w:tcPr>` +
                `<w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr><w:t>${itDesc}</w:t></w:r></w:p></w:tc>` +
                // V. Unitario (gridSpan 2)
                `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:gridSpan w:val="2"/><w:tcBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/></w:tcBorders><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/><w:hideMark/></w:tcPr>` +
                `<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr><w:t>$${itUnit}</w:t></w:r></w:p></w:tc>` +
                // V. Total
                `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="6" w:space="0" w:color="auto"/></w:tcBorders><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/><w:hideMark/></w:tcPr>` +
                `<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="1F1F1F"/></w:rPr><w:t>$${itTotal}</w:t></w:r></w:p></w:tc>` +
                `</w:tr>`;
        }).join('');

        const newTbl = tblPr + tblGrid + headerTr + dataRowsXml + '</w:tbl>';
        xml = xml.substring(0, tblStart) + newTbl + xml.substring(tblEnd);
    }

    // 7. Subtotal, IVA y Total a Pagar
    xml = xml.replace(/<w:t>575<\/w:t>/g, `<w:t>${subtotalStr}</w:t>`);
    xml = xml.replace(/<w:t>86,25<\/w:t>/g, `<w:t>${ivaStr}</w:t>`);
    xml = xml.replace(/<w:t>661,25<\/w:t>/g, `<w:t>${totalStr}</w:t>`);
    if (ivaRate !== 15) {
        xml = xml.replace('<w:t>IVA (15%):</w:t>', `<w:t>IVA (${ivaRate}%):</w:t>`);
    }

    // 8. Validez de la proforma
    xml = xml.replace('15 dias a partir', `${validez} dias a partir`);

    // 9. Emisor y Teléfono
    xml = xml.replace('<w:t>Cristian Capelo</w:t>', `<w:t>${proformaXmlEscape(emisor)}</w:t>`);
    xml = xml.replace('<w:t>Telefono: 0969528406</w:t>', `<w:t>Telefono: ${proformaXmlEscape(telefonoEmisor)}</w:t>`);

    zip.file('word/document.xml', xml);

    const safeNum = numero.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeClient = proformaSanitizeFileName(cliente);
    const filename = `PROFORMA_${safeNum}_${safeClient}.docx`;
    return { zip, filename, cliente, numero };
};

window.generateWordProforma = async function() {
    if (!window.currentProforma) return;
    try {
        if (typeof showMessage === 'function') showMessage('⏳ Generando Word Oficial con Hoja Membretada...', 'fix-report');
        const { zip, filename } = await window.buildWordZipProforma(window.currentProforma);
        const blob = await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 250);

        if (typeof showMessage === 'function') showMessage(`✅ Descargado: ${filename}`, 'fix-report');
    } catch (err) {
        console.error('Error generando Word:', err);
        if (typeof showMessage === 'function') showMessage('❌ Error generando Word: ' + err.message, 'fix-error');
    }
};

// ============================================================================
// 5. IMPRIMIR Y EXPORTAR A PDF (A4 CON HOJA MEMBRETADA)
// ============================================================================
window.printProformaSheet = function() {
    window.switchProformaTab('preview');
    setTimeout(() => {
        window.print();
    }, 200);
};

// ============================================================================
// 6. COMPARTIR VÍA WHATSAPP O COPIAR TEXTO
// ============================================================================
window.shareProformaWhatsApp = function() {
    if (!window.currentProforma) return;
    const p = window.currentProforma;
    let msg = `🛠️ *PROFORMA FIX - SERVICIO TÉCNICO*\n`;
    msg += `📄 *Nro:* ${p.numero}\n`;
    msg += `📅 *Fecha:* ${p.fechaTexto}\n`;
    msg += `👤 *Cliente:* ${p.cliente || 'Estimado/a Cliente'}\n`;
    if (p.ruc) msg += `💼 *RUC/CI:* ${p.ruc}\n`;
    msg += `\n📌 *Detalle de Cotización:*\n`;

    (p.items || []).forEach((it, idx) => {
        const c = it.cant || 1;
        const cod = it.codigo ? `[${it.codigo}] ` : '';
        const d = it.desc || 'Ítem';
        const t = formatMoney(it.total || 0);
        msg += `${idx + 1}. ${c}x ${cod}${d} - *$${t}*\n`;
    });

    msg += `\n💵 *Subtotal:* $${formatMoney(p.subtotal)}`;
    if (p.aplicaIva) {
        msg += `\n📊 *IVA (${p.ivaRate}%):* $${formatMoney(p.iva)}`;
    }
    msg += `\n⭐ *TOTAL A PAGAR:* $${formatMoney(p.total)}\n`;
    msg += `\n⏳ *Validez:* ${p.validezDias || 15} días.`;
    msg += `\n👨‍🔧 *${p.emisor || 'Cristian Capelo'}* - ${p.telefonoEmisor || '0969528406'}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).then(() => {
            if (typeof showMessage === 'function') showMessage('📋 Resumen copiado al portapapeles', 'fix-report');
        }).catch(() => {});
    }

    const cleanTel = (p.telefono || '').replace(/[^0-9]/g, '');
    let waUrl = `https://wa.me/`;
    if (cleanTel.length >= 9) {
        const fullTel = cleanTel.startsWith('593') ? cleanTel : (cleanTel.startsWith('0') ? '593' + cleanTel.substring(1) : '593' + cleanTel);
        waUrl += fullTel;
    }
    waUrl += `?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
};

// ============================================================================
// 7. GUARDAR PROFORMA EN HISTORIAL (FIREBASE + LOCALSTORAGE)
// ============================================================================
window.saveProformaToHistory = function() {
    if (!window.currentProforma) return;
    window.calcProformaTotals();
    const p = window.currentProforma;
    p.updatedAt = new Date().toISOString();

    // Actualizar en array en memoria
    const existingIdx = window.proformasArray.findIndex(x => x.id === p.id);
    if (existingIdx >= 0) {
        window.proformasArray[existingIdx] = { ...p };
    } else {
        window.proformasArray.unshift({ ...p });
    }

    // Guardar en Firebase si está disponible
    if (typeof database !== 'undefined' && database && database.ref) {
        try {
            database.ref('proformas/' + p.id).set(p).then(() => {
                if (typeof showMessage === 'function') showMessage('💾 Proforma guardada exitosamente en la nube', 'fix-report');
            }).catch(err => {
                console.warn('Firebase proformas save err:', err);
            });
        } catch (e) {
            console.warn('Error saving to firebase:', e);
        }
    }

    // Respaldo en LocalStorage
    try {
        localStorage.setItem('fix_proformas_backup', JSON.stringify(window.proformasArray));
        if (typeof showMessage === 'function') showMessage('💾 Proforma guardada exitosamente', 'fix-report');
    } catch (e) {
        console.warn('LocalStorage error:', e);
    }

    window.updateProformasBadge();
};

window.loadProformaFromHistory = function(proformaId) {
    const found = (window.proformasArray || []).find(p => p.id === proformaId);
    if (!found) return;
    window.currentProforma = JSON.parse(JSON.stringify(found));
    window.calcProformaTotals();
    window.renderProformaModule();
    window.closeProformaHistoryModal();
    if (typeof showMessage === 'function') showMessage(`📂 Proforma ${found.numero} cargada`, 'fix-report');
};

window.duplicateProforma = function(proformaId) {
    const found = (window.proformasArray || []).find(p => p.id === proformaId);
    if (!found) return;
    const duplicated = JSON.parse(JSON.stringify(found));
    duplicated.id = 'prof_' + Date.now();
    duplicated.numero = generateNextProformaNumber();
    duplicated.fecha = getProformaTodayISO();
    duplicated.fechaTexto = getProformaFechaTexto(duplicated.fecha);
    duplicated.createdAt = new Date().toISOString();
    delete duplicated.updatedAt;

    window.currentProforma = duplicated;
    window.calcProformaTotals();
    window.renderProformaModule();
    window.closeProformaHistoryModal();
    if (typeof showMessage === 'function') showMessage(`📋 Duplicada como ${duplicated.numero}`, 'fix-report');
};

window.deleteProformaFromHistory = function(proformaId) {
    if (!confirm('¿Seguro que deseas eliminar esta proforma del historial?')) return;
    window.proformasArray = (window.proformasArray || []).filter(p => p.id !== proformaId);
    
    if (typeof database !== 'undefined' && database && database.ref) {
        try {
            database.ref('proformas/' + proformaId).remove();
        } catch (e) {}
    }
    try {
        localStorage.setItem('fix_proformas_backup', JSON.stringify(window.proformasArray));
    } catch (e) {}

    window.updateProformasBadge();
    window.renderProformaHistoryList();
    if (typeof showMessage === 'function') showMessage('🗑️ Proforma eliminada', 'fix-error');
};

window.updateProformasBadge = function() {
    const count = (window.proformasArray || []).length;
    const badge = document.getElementById('sidebarProformasBadge');
    if (badge) badge.innerText = count > 0 ? count : 'NUEVO';
    const metroBadge = document.getElementById('metroTileBadge_proformas');
    if (metroBadge) metroBadge.innerText = `${count} Cotiz.`;
};

// ============================================================================
// 8. RENDERIZADO DEL MÓDULO Y HOJA MEMBRETADA EN VIVO
// ============================================================================
window.switchProformaTab = function(tab) {
    window.proformaActiveTab = tab;
    const editorSec = document.getElementById('proformaEditorSection');
    const previewSec = document.getElementById('proformaPreviewSection');
    const tabEditBtn = document.getElementById('proformaTabBtn_editor');
    const tabPrevBtn = document.getElementById('proformaTabBtn_preview');

    if (window.innerWidth >= 1024) {
        // En desktop se muestran ambas columnas
        if (editorSec) editorSec.classList.remove('hidden');
        if (previewSec) previewSec.classList.remove('hidden');
    } else {
        // En móvil/tablet se alterna
        if (tab === 'editor') {
            if (editorSec) editorSec.classList.remove('hidden');
            if (previewSec) previewSec.classList.add('hidden');
            if (tabEditBtn) { tabEditBtn.classList.add('bg-sky-600', 'text-white'); tabEditBtn.classList.remove('text-stone-600', 'dark:text-slate-300'); }
            if (tabPrevBtn) { tabPrevBtn.classList.remove('bg-sky-600', 'text-white'); tabPrevBtn.classList.add('text-stone-600', 'dark:text-slate-300'); }
        } else {
            if (editorSec) editorSec.classList.add('hidden');
            if (previewSec) previewSec.classList.remove('hidden');
            if (tabPrevBtn) { tabPrevBtn.classList.add('bg-sky-600', 'text-white'); tabPrevBtn.classList.remove('text-stone-600', 'dark:text-slate-300'); }
            if (tabEditBtn) { tabEditBtn.classList.remove('bg-sky-600', 'text-white'); tabEditBtn.classList.add('text-stone-600', 'dark:text-slate-300'); }
        }
    }
    window.updateProformaLiveSheetDOM();
};

window.renderProformaModule = function() {
    if (!window.currentProforma) {
        window.initNewProforma();
        return;
    }
    window.renderProformaEditor();
    window.updateProformaLiveSheetDOM();
    window.updateProformasBadge();
};

window.renderProformaEditor = function() {
    const container = document.getElementById('proformaEditorContainer');
    if (!container) return;
    const p = window.currentProforma;

    let itemsHtml = (p.items || []).map((it, idx) => `
        <div class="relative bg-white dark:bg-slate-800/90 p-3 rounded-xl border border-stone-200 dark:border-slate-700 shadow-xs space-y-2 group transition-all" id="proformaRowDOM_${idx}">
            <div class="flex items-center justify-between gap-2">
                <span class="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                    ${idx + 1}
                </span>
                
                <!-- Cantidad -->
                <div class="flex items-center gap-1 shrink-0">
                    <span class="text-[11px] font-bold text-stone-500 dark:text-slate-400">Cant:</span>
                    <input type="number" min="1" step="1" value="${it.cant || 1}" 
                        onchange="updateProformaRowField(${idx}, 'cant', this.value)"
                        class="w-16 px-2 py-1 rounded-lg border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-white font-mono font-bold text-xs text-center focus:ring-2 focus:ring-sky-500">
                </div>

                <!-- Subtotal Fila -->
                <div class="ml-auto text-right font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400" id="proformaItemTotal_${idx}">
                    $${formatMoney(it.total)}
                </div>

                <!-- Botón Eliminar Fila -->
                <button type="button" onclick="removeProformaRow(${idx})" title="Eliminar fila" 
                    class="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>

            <!-- Código y Autocompletado -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div class="sm:col-span-4 relative">
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 mb-0.5">
                        Código Repuesto:
                    </label>
                    <div class="relative flex items-center">
                        <input type="text" value="${it.codigo || ''}" placeholder="Ej: 1110000002"
                            oninput="handleProformaCodeInput(${idx}, this.value)"
                            onfocus="handleProformaCodeInput(${idx}, this.value)"
                            class="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-white font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-sky-500">
                        <button type="button" onclick="openProformaRepuestoModal(${idx})" title="Buscar en catálogo TEKA"
                            class="absolute right-1 p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-800 rounded-md transition-all">
                            🔍
                        </button>
                    </div>
                    <!-- Dropdown flotante de sugerencias -->
                    <div id="proformaDropdown_${idx}" class="hidden absolute left-0 top-full mt-1 w-72 sm:w-80 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-xl shadow-xl z-50"></div>
                </div>

                <!-- Descripción -->
                <div class="sm:col-span-5">
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 mb-0.5">
                        Descripción:
                    </label>
                    <input type="text" value="${it.desc || ''}" placeholder="Descripción del repuesto o servicio..."
                        onchange="updateProformaRowField(${idx}, 'desc', this.value)"
                        class="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-sky-500">
                </div>

                <!-- Precio Unitario -->
                <div class="sm:col-span-3">
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 mb-0.5">
                        V. Unitario ($):
                    </label>
                    <input type="number" step="0.01" min="0" value="${it.unit || 0}"
                        onchange="updateProformaRowField(${idx}, 'unit', this.value)"
                        class="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-white font-mono font-bold text-xs text-right focus:ring-2 focus:ring-sky-500">
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="space-y-4">
            <!-- Bloque Cabecera -->
            <div class="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-stone-200/80 dark:border-slate-700/80 pb-2">
                    <span class="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                        <span>📋</span> Datos de la Proforma
                    </span>
                    <input type="text" value="${p.numero}" onchange="updateProformaHeaderField('numero', this.value)"
                        class="px-2 py-0.5 font-mono font-black text-xs text-right uppercase bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded-lg">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                        <label class="block text-[10.5px] font-bold uppercase text-stone-600 dark:text-slate-300 mb-1">Fecha Emisión:</label>
                        <input type="date" value="${p.fecha}" onchange="updateProformaHeaderField('fecha', this.value)"
                            class="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white font-semibold text-xs">
                    </div>
                    <div class="sm:col-span-2 relative">
                        <label class="block text-[10.5px] font-bold uppercase text-stone-600 dark:text-slate-300 mb-1">
                            Cliente: <span class="text-stone-400 font-normal">(Escribe o busca clientes previos)</span>
                        </label>
                        <div class="relative flex items-center">
                            <input type="text" value="${p.cliente}" placeholder="Nombre del cliente o empresa..."
                                oninput="handleProformaClientInput(this.value)"
                                onchange="updateProformaHeaderField('cliente', this.value)"
                                class="w-full pl-2.5 pr-8 py-1.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-900 dark:text-white font-bold text-xs uppercase">
                            <button type="button" onclick="openProformaClientSelector()" title="Seleccionar de visitas previas"
                                class="absolute right-1.5 p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-800 rounded-md">
                                👥
                            </button>
                        </div>
                        <div id="proformaClientDropdown" class="hidden absolute left-0 top-full mt-1 w-full max-h-44 overflow-y-auto bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 rounded-xl shadow-xl z-50"></div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                        <label class="block text-[10.5px] font-bold uppercase text-stone-600 dark:text-slate-300 mb-1">RUC / C.I.:</label>
                        <input type="text" value="${p.ruc}" placeholder="0102030405001"
                            onchange="updateProformaHeaderField('ruc', this.value)"
                            class="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white font-mono font-semibold text-xs">
                    </div>
                    <div>
                        <label class="block text-[10.5px] font-bold uppercase text-stone-600 dark:text-slate-300 mb-1">Teléfono / WhatsApp:</label>
                        <input type="text" value="${p.telefono}" placeholder="0991234567"
                            onchange="updateProformaHeaderField('telefono', this.value)"
                            class="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white font-mono font-semibold text-xs">
                    </div>
                </div>

                <div>
                    <label class="block text-[10.5px] font-bold uppercase text-stone-600 dark:text-slate-300 mb-1">Texto Introductorio / Solicitud:</label>
                    <textarea rows="2" onchange="updateProformaHeaderField('introTexto', this.value)"
                        class="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-sky-500">${p.introTexto}</textarea>
                    
                    <!-- Presets rápidos -->
                    <div class="flex items-center gap-1.5 mt-1 overflow-x-auto pb-1 text-[10px]">
                        <span class="text-stone-400 font-bold shrink-0">Plantillas rápidas:</span>
                        <button type="button" onclick="setProformaIntroPreset('indurama')" class="px-2 py-0.5 bg-stone-100 dark:bg-slate-700 hover:bg-sky-100 text-stone-700 dark:text-slate-200 rounded-md font-medium shrink-0">Indurama Servidor</button>
                        <button type="button" onclick="setProformaIntroPreset('repuestos')" class="px-2 py-0.5 bg-stone-100 dark:bg-slate-700 hover:bg-sky-100 text-stone-700 dark:text-slate-200 rounded-md font-medium shrink-0">Repuestos TEKA</button>
                        <button type="button" onclick="setProformaIntroPreset('mantenimiento')" class="px-2 py-0.5 bg-stone-100 dark:bg-slate-700 hover:bg-sky-100 text-stone-700 dark:text-slate-200 rounded-md font-medium shrink-0">Mantenimiento Preventivo</button>
                    </div>
                </div>
            </div>

            <!-- Bloque Tabla de Ítems -->
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span>🔧</span> Ítems y Repuestos (${(p.items || []).length})
                    </span>
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="addProformaServicioRow()" class="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 text-xs font-bold transition-all active:scale-95 flex items-center gap-1">
                            <span>🛠️</span> + Mano de Obra
                        </button>
                        <button type="button" onclick="addProformaRow()" class="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1">
                            <span>➕</span> + Repuesto
                        </button>
                    </div>
                </div>

                <div class="space-y-2" id="proformaItemsList">
                    ${itemsHtml}
                </div>
            </div>

            <!-- Bloque Totales e IVA -->
            <div class="p-3.5 rounded-2xl bg-gradient-to-br from-stone-50 to-sky-50/40 dark:from-slate-800/80 dark:to-slate-900 border border-stone-200 dark:border-slate-700 shadow-xs space-y-2.5" id="proformaTotalsContainer">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-stone-600 dark:text-slate-300">SUBTOTAL:</span>
                    <span class="font-mono font-black text-stone-900 dark:text-white text-sm" id="proformaTotal_subtotal">$${formatMoney(p.subtotal)}</span>
                </div>

                <div class="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-slate-700">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-stone-600 dark:text-slate-300">
                        <input type="checkbox" ${p.aplicaIva ? 'checked' : ''} onchange="updateProformaHeaderField('aplicaIva', this.checked)"
                            class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500">
                        <span>Calcular IVA (${p.ivaRate}%):</span>
                    </label>
                    <span class="font-mono font-bold text-stone-800 dark:text-slate-200 text-xs" id="proformaTotal_iva">$${formatMoney(p.iva)}</span>
                </div>

                <div class="flex items-center justify-between text-sm pt-2 border-t-2 border-sky-500/30">
                    <span class="font-black text-sky-900 dark:text-sky-300 uppercase tracking-wide">TOTAL A PAGAR:</span>
                    <span class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg" id="proformaTotal_total">$${formatMoney(p.total)}</span>
                </div>
            </div>

            <!-- Pie de Proforma y Validez -->
            <div class="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-stone-200 dark:border-slate-700 space-y-2 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">Validez (días):</label>
                        <input type="number" min="1" value="${p.validezDias || 15}" onchange="updateProformaHeaderField('validezDias', this.value)"
                            class="w-full px-2 py-1 rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white font-mono font-bold text-xs">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">Firma / Emisor:</label>
                        <input type="text" value="${p.emisor || 'Cristian Capelo'}" onchange="updateProformaHeaderField('emisor', this.value)"
                            class="w-full px-2 py-1 rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white font-bold text-xs">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">Teléfono Emisor:</label>
                        <input type="text" value="${p.telefonoEmisor || '0969528406'}" onchange="updateProformaHeaderField('telefonoEmisor', this.value)"
                            class="w-full px-2 py-1 rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-stone-800 dark:text-white font-mono font-bold text-xs">
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.setProformaIntroPreset = function(type) {
    if (!window.currentProforma) return;
    if (type === 'indurama') {
        window.currentProforma.introTexto = 'Estimado cliente, se nos ha solicitado valorar costo de instalacion de un equipo acondicionador de aire marac indurama para el cuarto del servidor:';
    } else if (type === 'repuestos') {
        window.currentProforma.introTexto = 'Estimado cliente, presentamos la valoración de repuestos originales TEKA y servicio técnico especializado:';
    } else if (type === 'mantenimiento') {
        window.currentProforma.introTexto = 'Estimado cliente, se nos ha solicitado cotizar el mantenimiento preventivo y correctivo con repuestos para su equipo:';
    }
    window.renderProformaEditor();
    window.updateProformaLiveSheetDOM();
};

window.updateProformaRowDOM = function(rowIndex) {
    const it = window.currentProforma.items[rowIndex];
    if (!it) return;
    window.renderProformaEditor();
};

window.updateProformaTotalsDOM = function() {
    const p = window.currentProforma;
    if (!p) return;
    const subEl = document.getElementById('proformaTotal_subtotal');
    const ivaEl = document.getElementById('proformaTotal_iva');
    const totEl = document.getElementById('proformaTotal_total');
    if (subEl) subEl.innerText = `$${formatMoney(p.subtotal)}`;
    if (ivaEl) ivaEl.innerText = `$${formatMoney(p.iva)}`;
    if (totEl) totEl.innerText = `$${formatMoney(p.total)}`;
};

// ============================================================================
// 9. ACTUALIZACIÓN EN VIVO DE LA HOJA MEMBRETADA (LIVE SHEET WYSIWYG)
// ============================================================================
window.updateProformaLiveSheetDOM = function() {
    const sheet = document.getElementById('proformaLiveSheet');
    if (!sheet || !window.currentProforma) return;
    const p = window.currentProforma;

    const itemsRowsHtml = (p.items || []).map(it => `
        <tr class="border-b border-black text-[12px] leading-tight">
            <td class="py-1.5 px-2 text-center font-bold border-r border-black w-[10%]">${it.cant || 1}</td>
            <td class="py-1.5 px-2 text-center font-mono font-bold border-r border-black w-[18%]">${it.codigo || '---'}</td>
            <td class="py-1.5 px-2 text-left font-medium border-r border-black w-[42%]">${it.desc || '---'}</td>
            <td class="py-1.5 px-2 text-right font-mono font-semibold border-r border-black w-[15%]">$${formatMoney(it.unit || 0)}</td>
            <td class="py-1.5 px-2 text-right font-mono font-bold w-[15%]">$${formatMoney(it.total || 0)}</td>
        </tr>
    `).join('');

    sheet.innerHTML = `
        <div class="proforma-a4-inner flex flex-col justify-between h-full text-black font-sans select-text">
            <!-- Bloque Superior de Contenido -->
            <div>
                <!-- Título Central -->
                <div class="text-center font-black text-xl sm:text-2xl tracking-wider uppercase mb-1 text-black">
                    PROFORMA
                    ${p.numero ? `<span class="text-xs font-mono font-normal block text-stone-700">${p.numero}</span>` : ''}
                </div>

                <!-- Fecha Derecha -->
                <div class="text-right font-bold text-xs sm:text-sm mb-4 text-black">
                    Fecha: <span class="font-normal underline">${p.fechaTexto || '……………'}</span>
                </div>

                <!-- Destinatario y Cliente -->
                <div class="space-y-0.5 text-xs sm:text-sm mb-4 text-black">
                    <div class="font-semibold">Sres.</div>
                    <div><span class="font-bold">Cliente:</span> <span class="font-medium uppercase">${p.cliente || '_______________________________'}</span></div>
                    <div><span class="font-bold">RUC:</span> <span class="font-mono">${p.ruc || '___________________'}</span> ${p.telefono ? `<span class="ml-4 font-bold">Teléfono:</span> <span class="font-mono">${p.telefono}</span>` : ''}</div>
                </div>

                <!-- Texto Solicitud -->
                <div class="text-xs sm:text-sm leading-relaxed mb-4 text-justify text-black">
                    ${p.introTexto}
                </div>

                <!-- Tabla de Repuestos / Ítems -->
                <div class="mb-4">
                    <table class="w-full border-collapse border border-black text-xs text-black">
                        <thead>
                            <tr class="border-b-2 border-black bg-stone-100/70 font-black text-center text-[11px] uppercase">
                                <th class="py-1.5 px-2 border-r border-black w-[10%]">Cant.</th>
                                <th class="py-1.5 px-2 border-r border-black w-[18%]">Código</th>
                                <th class="py-1.5 px-2 border-r border-black w-[42%] text-left">Descripción</th>
                                <th class="py-1.5 px-2 border-r border-black w-[15%] text-right">V. Unitario</th>
                                <th class="py-1.5 px-2 text-right w-[15%]">V. Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Totales a la Derecha -->
                <div class="flex flex-col items-end space-y-1 text-xs sm:text-sm font-semibold mb-6 text-black">
                    <div class="flex items-center gap-3">
                        <span> &nbsp;<strong>SUBTOTAL:</strong></span>
                        <span class="font-mono font-bold w-24 text-right">$${formatMoney(p.subtotal)}</span>
                    </div>
                    ${p.aplicaIva ? `
                    <div class="flex items-center gap-3">
                        <span> &nbsp;<strong>IVA (${p.ivaRate}%):</strong></span>
                        <span class="font-mono font-bold w-24 text-right">$${formatMoney(p.iva)}</span>
                    </div>` : ''}
                    <div class="flex items-center gap-3 text-sm sm:text-base border-t border-black pt-1">
                        <span> &nbsp;<strong>TOTAL A PAGAR:</strong></span>
                        <span class="font-mono font-black w-24 text-right text-black">$${formatMoney(p.total)}</span>
                    </div>
                </div>

                <!-- Validez -->
                <div class="text-xs leading-normal mb-8 text-stone-800">
                    La presente tiene validez de ${p.validezDias || 15} dias a partir de la fecha de emision.
                </div>
            </div>

            <!-- Firma y Teléfono Emisor -->
            <div class="pt-4 text-xs sm:text-sm font-bold space-y-0.5 text-black">
                <div>${p.emisor || 'Cristian Capelo'}</div>
                <div>Telefono: ${p.telefonoEmisor || '0969528406'}</div>
            </div>
        </div>
    `;
};

// ============================================================================
// 10. BÚSQUEDA RÁPIDA DE CLIENTES PREVIOS (AUTOCOMPLETE)
// ============================================================================
window.handleProformaClientInput = function(query) {
    if (!window.currentProforma) return;
    window.currentProforma.cliente = query.toUpperCase();
    window.updateProformaLiveSheetDOM();

    const clean = query.trim().toUpperCase();
    const drop = document.getElementById('proformaClientDropdown');
    if (!drop) return;

    if (clean.length < 2) {
        drop.classList.add('hidden');
        return;
    }

    const visits = window.visitsArray || [];
    const matched = [];
    const seen = new Set();

    for (const v of visits) {
        const cName = (v.cliente || v.nombre || '').trim().toUpperCase();
        if (cName && cName.includes(clean) && !seen.has(cName)) {
            seen.add(cName);
            matched.push({
                nombre: cName,
                cedulaRuc: v.cedulaRuc || v.cedula || '',
                telefono: v.telefono || v.contacto || '',
                direccion: v.direccion || ''
            });
            if (matched.length >= 6) break;
        }
    }

    if (matched.length > 0) {
        drop.innerHTML = matched.map(m => `
            <div onclick="selectClientForProforma('${m.nombre.replace(/'/g, "\\'")}', '${m.cedulaRuc.replace(/'/g, "\\'")}', '${m.telefono.replace(/'/g, "\\'")}')"
                class="p-2.5 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer border-b border-stone-100 dark:border-slate-600 text-xs transition-colors">
                <div class="font-bold text-stone-900 dark:text-white">${m.nombre}</div>
                <div class="text-[11px] text-stone-500 dark:text-slate-400 font-mono flex items-center gap-3">
                    ${m.cedulaRuc ? `<span>RUC: ${m.cedulaRuc}</span>` : ''}
                    ${m.telefono ? `<span>Tel: ${m.telefono}</span>` : ''}
                </div>
            </div>
        `).join('');
        drop.classList.remove('hidden');
    } else {
        drop.classList.add('hidden');
    }
};

window.selectClientForProforma = function(nombre, ruc, tel) {
    if (!window.currentProforma) return;
    window.currentProforma.cliente = nombre;
    if (ruc && (!window.currentProforma.ruc || window.currentProforma.ruc === '---')) {
        window.currentProforma.ruc = ruc;
    }
    if (tel && (!window.currentProforma.telefono || window.currentProforma.telefono === '---')) {
        window.currentProforma.telefono = tel;
    }
    const drop = document.getElementById('proformaClientDropdown');
    if (drop) drop.classList.add('hidden');
    window.renderProformaEditor();
    window.updateProformaLiveSheetDOM();
};

window.openProformaClientSelector = function() {
    window.handleProformaClientInput('A');
};

// ============================================================================
// 11. MODAL PICKER DE REPUESTOS EN PROFORMA
// ============================================================================
window.openProformaRepuestoModal = function(rowIndex) {
    window.proformaPickerRowIndex = rowIndex;
    const modal = document.getElementById('modalProformaRepuestoPicker');
    if (modal) {
        modal.classList.remove('hidden');
        const input = document.getElementById('searchProformaRepuestoPickerInput');
        if (input) {
            input.value = '';
            input.focus();
        }
        window.filterProformaRepuestoPicker();
    }
};

window.closeProformaRepuestoModal = function() {
    const modal = document.getElementById('modalProformaRepuestoPicker');
    if (modal) modal.classList.add('hidden');
    window.proformaPickerRowIndex = null;
};

window.filterProformaRepuestoPicker = function() {
    const tbody = document.getElementById('proformaRepuestoPickerTableBody');
    if (!tbody) return;
    const input = document.getElementById('searchProformaRepuestoPickerInput');
    const query = input ? input.value.trim().toUpperCase() : '';
    const repuestos = window.LISTA_REPUESTOS_TEKA || [];
    
    let list = repuestos;
    if (query) {
        list = repuestos.filter(r => (r.cod && r.cod.toUpperCase().includes(query)) || (r.desc && r.desc.toUpperCase().includes(query)));
    }
    const display = list.slice(0, 50);

    tbody.innerHTML = display.map(r => `
        <tr class="border-b border-stone-200 dark:border-slate-700 hover:bg-sky-50/70 dark:hover:bg-slate-700/50 transition-colors">
            <td class="p-2.5 font-mono font-bold text-sky-800 dark:text-sky-300 text-xs text-center">${r.cod}</td>
            <td class="p-2.5 font-semibold text-stone-800 dark:text-slate-200 text-xs">${r.desc}</td>
            <td class="p-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs text-right">$${Number(r.precio || 0).toFixed(2)}</td>
            <td class="p-2.5 text-center">
                <button type="button" onclick="selectRepuestoFromModalPicker('${r.cod.replace(/'/g, "\\'")}', '${r.desc.replace(/'/g, "\\'")}', ${r.precio || 0})"
                    class="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold uppercase transition-all shadow-xs active:scale-95">
                    Seleccionar
                </button>
            </td>
        </tr>
    `).join('');
};

window.selectRepuestoFromModalPicker = function(cod, desc, precio) {
    if (window.proformaPickerRowIndex !== null) {
        window.selectRepuestoForProformaRow(window.proformaPickerRowIndex, cod, desc, precio);
    }
    window.closeProformaRepuestoModal();
};

// ============================================================================
// 12. HISTORIAL DE PROFORMAS (MODAL Y LISTADO)
// ============================================================================
window.openProformaHistoryModal = function() {
    const modal = document.getElementById('modalProformasHistory');
    if (modal) {
        modal.classList.remove('hidden');
        window.renderProformaHistoryList();
    }
};

window.closeProformaHistoryModal = function() {
    const modal = document.getElementById('modalProformasHistory');
    if (modal) modal.classList.add('hidden');
};

window.renderProformaHistoryList = function() {
    const container = document.getElementById('proformasHistoryListContainer');
    if (!container) return;
    const filterInput = document.getElementById('proformaHistoryFilterInput');
    const query = filterInput ? filterInput.value.trim().toUpperCase() : '';

    let list = window.proformasArray || [];
    if (query) {
        list = list.filter(p => 
            (p.numero && p.numero.toUpperCase().includes(query)) ||
            (p.cliente && p.cliente.toUpperCase().includes(query)) ||
            (p.ruc && p.ruc.toUpperCase().includes(query))
        );
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center text-stone-400 dark:text-slate-500">
                <div class="text-4xl mb-2">📂</div>
                <div class="font-bold text-sm">No hay proformas en el historial</div>
                <div class="text-xs">Crea y guarda una nueva proforma para verla aquí.</div>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(p => `
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-sky-400 transition-all">
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300">
                        ${p.numero}
                    </span>
                    <span class="text-xs text-stone-500 dark:text-slate-400 font-semibold">
                        📅 ${p.fechaTexto || p.fecha}
                    </span>
                    <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        ${p.items ? p.items.length : 0} ítems
                    </span>
                </div>
                <div class="font-black text-stone-900 dark:text-white text-sm truncate uppercase">
                    ${p.cliente || 'CLIENTE SIN NOMBRE'}
                </div>
                <div class="text-xs text-stone-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
                    ${p.ruc ? `<span>RUC: ${p.ruc}</span>` : ''}
                    ${p.telefono ? `<span>Tel: ${p.telefono}</span>` : ''}
                </div>
            </div>

            <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                <div class="text-right mr-2">
                    <span class="text-[10px] block text-stone-400 uppercase font-bold">Total</span>
                    <span class="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">$${formatMoney(p.total)}</span>
                </div>
                <button type="button" onclick="loadProformaFromHistory('${p.id}')" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95" title="Abrir y editar">
                    Abrir
                </button>
                <button type="button" onclick="duplicateProforma('${p.id}')" class="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-200 rounded-xl text-xs transition-all" title="Duplicar">
                    📋
                </button>
                <button type="button" onclick="deleteProformaFromHistory('${p.id}')" class="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-xl text-xs transition-all" title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
};

// Cargar proformas desde LocalStorage al iniciar
try {
    const saved = localStorage.getItem('fix_proformas_backup');
    if (saved) {
        window.proformasArray = JSON.parse(saved);
    }
} catch (e) {}
