// ==========================================================================
// MODULO OFICIAL DE SOLICITUDES DE REPUESTOS DE VENTA (TEKA)
// Generación exacta con formato oficial REPUESTO.xlsx y pestaña 'VENTAS'
// ==========================================================================

// Array global en memoria de solicitudes de venta
window.solicitudesVentaArray = [];
try {
    const backupVenta = localStorage.getItem('fix_solicitudes_venta_backup');
    if (backupVenta) {
        window.solicitudesVentaArray = JSON.parse(backupVenta);
    }
} catch(e){}
window.currentSolicitudVentaEditId = null;
window.tempVentaItems = [];

// Utilitario para decodificar base64 a Uint8Array
function b64ToUint8Venta(base64) {
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

// Limpiar nombres para nombres de archivo
function sanitizeFileNameVenta(str) {
    if (!str) return 'CLIENTE';
    return String(str)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .toUpperCase();
}

// Descargar un Blob en el navegador
function triggerDownloadBlobVenta(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 200);
}

// ==========================================================================
// 1. CORRELATIVO Y NUMERACIÓN (ARRANCA ESTRICTAMENTE EN 070 2026)
// ==========================================================================
window.getNextSolicitudVentaNumero = function() {
    const list = window.solicitudesVentaArray || [];
    let maxSeq = 69; // Para que el primer número sugerido sea mínimo 070
    list.forEach(s => {
        let seq = parseInt(s.numeroSecuencia, 10);
        if (isNaN(seq) && s.numeroSolicitud) {
            const m = String(s.numeroSolicitud).match(/(\d+)/);
            if (m) seq = parseInt(m[1], 10);
        }
        if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
        }
    });
    const nextSeq = maxSeq + 1;
    return {
        numeroSecuencia: nextSeq,
        numeroSolicitud: String(nextSeq).padStart(3, '0') + ' 2026'
    };
};

window.stepSolicitudVentaNumero = function(delta) {
    const input = document.getElementById('venta_numero');
    if (!input) return;
    let val = input.value.trim();
    let currentSeq = 70;
    let year = '2026';
    const m = val.match(/(\d+)\s*(\d*)/);
    if (m && m[1]) {
        currentSeq = parseInt(m[1], 10);
        if (m[2]) year = m[2];
    }
    currentSeq += delta;
    if (currentSeq < 1) currentSeq = 1;
    input.value = String(currentSeq).padStart(3, '0') + ' ' + year;
};

// ==========================================================================
// 2. GENERADOR DE EXCEL (.xlsx) EXACTO CON PESTAÑA 'VENTAS'
// ==========================================================================
window.buildExcelWorkbookVenta = async function(data) {
    if (typeof ExcelJS === 'undefined') {
        throw new Error('La librería ExcelJS no está disponible.');
    }
    if (!window.REPUESTO_XLSX_BASE64) {
        throw new Error('Plantilla base de Excel REPUESTO.xlsx no encontrada.');
    }

    const wb = new ExcelJS.Workbook();
    const uint8 = b64ToUint8Venta(window.REPUESTO_XLSX_BASE64);
    await wb.xlsx.load(uint8.buffer);
    const ws = wb.worksheets[0];
    ws.name = 'VENTAS';

    const cliente = (data.cliente || '').toUpperCase().trim();
    const telefono = (data.telefono || '').trim();
    const direccion = (data.direccion || data.ciudad || 'Cuenca').toUpperCase().trim();
    const numStr = (data.numeroSolicitud || '070 2026').trim();

    // Encabezado idéntico a REPUESTO.xlsx
    ws.getCell('F5').value = cliente;
    ws.getCell('F6').value = telefono;

    // Fecha de envío D7
    if (data.fechaEnvio) {
        try {
            const parts = data.fechaEnvio.split('-');
            if (parts.length === 3) {
                ws.getCell('D7').value = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            } else {
                ws.getCell('D7').value = new Date();
            }
        } catch (e) {
            ws.getCell('D7').value = new Date();
        }
    } else {
        ws.getCell('D7').value = new Date();
    }

    ws.getCell('F7').value = direccion;
    ws.getCell('B8').value = 'SOLICITUD N°' + numStr;

    // Repuestos múltiples a partir de la fila 10
    const items = (data.items && data.items.length > 0) ? data.items : [
        {
            cod: data.codRepuesto || '',
            desc: data.descRepuesto || '',
            modelo: data.modelo || '',
            serie: data.serie || ''
        }
    ];

    // Limpiar celda original C12 de la plantilla por si acaso
    const origC12 = ws.getCell('C12');
    if (origC12) origC12.value = null;

    items.forEach((item, idx) => {
        const rowNum = 10 + idx;
        const row = ws.getRow(rowNum);
        row.height = 18;

        ws.getCell('B' + rowNum).value = idx + 1;
        ws.getCell('C' + rowNum).value = (item.cod || '').toUpperCase().trim();
        ws.getCell('D' + rowNum).value = (item.desc || '').toUpperCase().trim();
        ws.getCell('E' + rowNum).value = (item.modelo || '').toUpperCase().trim();
        ws.getCell('F' + rowNum).value = { formula: 'F5', result: cliente };
        ws.getCell('G' + rowNum).value = { formula: 'F6', result: telefono };
        ws.getCell('H' + rowNum).value = (item.serie || '').toUpperCase().trim();

        ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
            const cell = ws.getCell(col + rowNum);
            cell.alignment = {
                vertical: 'middle',
                horizontal: (col === 'D' || col === 'F') ? 'left' : 'center',
                wrapText: false
            };
            cell.font = {
                name: 'Calibri',
                size: 11,
                bold: false
            };
            cell.border = {
                top: { style: 'thin', color: { indexed: 64 } },
                bottom: { style: 'thin', color: { indexed: 64 } },
                left: { style: 'thin', color: { indexed: 64 } },
                right: { style: 'thin', color: { indexed: 64 } }
            };
        });
    });

    // Fila en blanco y leyenda 'Ventas'
    const blankRowNum = 10 + items.length;
    const ventasRowNum = blankRowNum + 1;

    ws.getRow(blankRowNum).height = 15;
    ws.getRow(ventasRowNum).height = 18;

    const cellVentas = ws.getCell('C' + ventasRowNum);
    cellVentas.value = 'Ventas';
    cellVentas.font = {
        name: 'Calibri',
        size: 11,
        bold: false
    };
    cellVentas.alignment = {
        vertical: 'middle',
        horizontal: 'center'
    };

    const numSlug = numStr.replace(/\s+/g, '_');
    const filename = 'REPUESTO_VENTA_' + numSlug + '_' + sanitizeFileNameVenta(cliente) + '.xlsx';
    return { wb, filename, cliente };
};

window.generateExcelVenta = async function(data) {
    try {
        const result = await window.buildExcelWorkbookVenta(data);
        if (!result) return false;

        const { wb, filename } = result;
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerDownloadBlobVenta(blob, filename);

        if (window.showMessage) {
            window.showMessage('✅ Excel de Venta generado exitosamente: ' + filename, 'fix-report');
        }
        return true;
    } catch (err) {
        console.error('Error generando Excel de Venta:', err);
        if (window.showMessage) window.showMessage('❌ Error generando Excel: ' + err.message, 'fix-error');
        return false;
    }
};

window.downloadSolicitudVentaExcelFromList = function(id) {
    const s = (window.solicitudesVentaArray || []).find(item => item.id === id);
    if (!s) return;
    window.generateExcelVenta(s);
};

// ==========================================================================
// 3. ADMINISTRACIÓN DE FILAS DINÁMICAS DE REPUESTOS EN EL MODAL
// ==========================================================================
window.syncVentaClientPhoneToRows = function() {
    const cliente = (document.getElementById('venta_cliente')?.value || '').trim().toUpperCase();
    const telefono = (document.getElementById('venta_telefono')?.value || '').trim();
    document.querySelectorAll('.venta-row-cliente').forEach(el => el.textContent = cliente || '---');
    document.querySelectorAll('.venta-row-telefono').forEach(el => el.textContent = telefono || '---');
};

function readCurrentVentaRowsFromDOM() {
    const rows = [];
    const container = document.getElementById('ventaRepuestosTableBody');
    if (!container) return rows;
    const trList = container.querySelectorAll('tr.venta-repuesto-row');
    trList.forEach((tr, idx) => {
        const cod = tr.querySelector('.venta-item-cod')?.value.trim().toUpperCase() || '';
        const desc = tr.querySelector('.venta-item-desc')?.value.trim().toUpperCase() || '';
        const modelo = tr.querySelector('.venta-item-modelo')?.value.trim().toUpperCase() || '';
        const serie = tr.querySelector('.venta-item-serie')?.value.trim().toUpperCase() || '';
        rows.push({ cod, desc, modelo, serie });
    });
    return rows;
}

window.renderVentaRepuestoRows = function() {
    const tbody = document.getElementById('ventaRepuestosTableBody');
    if (!tbody) return;

    if (!window.tempVentaItems || window.tempVentaItems.length === 0) {
        window.tempVentaItems = [{ cod: '', desc: '', modelo: '', serie: '' }];
    }

    const cliente = (document.getElementById('venta_cliente')?.value || '').trim().toUpperCase();
    const telefono = (document.getElementById('venta_telefono')?.value || '').trim();

    tbody.innerHTML = window.tempVentaItems.map((item, idx) => {
        return `
            <tr class="venta-repuesto-row border-b border-stone-200/80 hover:bg-amber-50/30 transition-colors">
                <td class="p-2 text-center font-mono font-bold text-xs text-slate-500">${idx + 1}</td>
                <td class="p-2 min-w-[150px]">
                    <div class="flex items-center gap-1">
                        <input type="text" id="venta_item_cod_${idx}" value="${item.cod || ''}" oninput="lookupRepuestoVentaCode(${idx})" placeholder="81483008..." class="venta-item-cod w-full p-2 bg-white rounded-lg text-xs font-black font-mono uppercase text-slate-900 border border-amber-300 outline-none focus:ring-1 focus:ring-amber-500">
                        <button type="button" onclick="openRepuestoPicker('solicitud_venta_row', ${idx})" class="p-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-black shrink-0 shadow-xs cursor-pointer active:scale-95" title="Buscar en Catálogo TEKA">🔍</button>
                    </div>
                </td>
                <td class="p-2 min-w-[240px]">
                    <input type="text" id="venta_item_desc_${idx}" value="${item.desc || ''}" placeholder="Descripción de la pieza..." class="venta-item-desc w-full p-2 bg-white rounded-lg text-xs font-bold uppercase text-slate-900 border border-slate-300 outline-none">
                </td>
                <td class="p-2 min-w-[150px]">
                    <input type="text" id="venta_item_modelo_${idx}" value="${item.modelo || ''}" placeholder="Ej. Horno HE 610, Encimera..." class="venta-item-modelo w-full p-2 bg-white rounded-lg text-xs font-bold uppercase text-slate-900 border border-slate-300 outline-none">
                </td>
                <td class="p-2 min-w-[130px] bg-slate-50/70 border-x border-slate-200">
                    <span class="venta-row-cliente font-bold text-xs uppercase text-slate-700 block truncate" title="${cliente}">${cliente || '---'}</span>
                </td>
                <td class="p-2 min-w-[110px] bg-slate-50/70 border-r border-slate-200">
                    <span class="venta-row-telefono font-mono text-xs text-slate-600 block">${telefono || '---'}</span>
                </td>
                <td class="p-2 min-w-[110px]">
                    <input type="text" id="venta_item_serie_${idx}" value="${item.serie || ''}" placeholder="Serie (Opcional)" class="venta-item-serie w-full p-2 bg-white rounded-lg text-xs font-mono uppercase text-slate-900 border border-slate-300 outline-none">
                </td>
                <td class="p-2 text-center">
                    <button type="button" onclick="removeRepuestoVentaRow(${idx})" class="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 mx-auto" title="Eliminar fila">✕</button>
                </td>
            </tr>
        `;
    }).join('');
};

window.addRepuestoVentaRow = function(itemData = null) {
    window.tempVentaItems = readCurrentVentaRowsFromDOM();
    window.tempVentaItems.push(itemData || { cod: '', desc: '', modelo: '', serie: '' });
    window.renderVentaRepuestoRows();
};

window.removeRepuestoVentaRow = function(index) {
    window.tempVentaItems = readCurrentVentaRowsFromDOM();
    if (window.tempVentaItems.length <= 1) {
        window.tempVentaItems = [{ cod: '', desc: '', modelo: '', serie: '' }];
    } else {
        window.tempVentaItems.splice(index, 1);
    }
    window.renderVentaRepuestoRows();
};

window.lookupRepuestoVentaCode = function(index) {
    const codInput = document.getElementById(`venta_item_cod_${index}`);
    const descInput = document.getElementById(`venta_item_desc_${index}`);
    if (!codInput || !descInput) return;
    const val = codInput.value.trim().toUpperCase();
    if (!val) return;
    const all = window.LISTA_REPUESTOS_TEKA || [];
    const match = all.find(r => r.cod && String(r.cod).trim().toUpperCase() === val);
    if (match) {
        descInput.value = match.desc || '';
    }
};

// ==========================================================================
// 4. MODAL: NUEVA Y EDITAR SOLICITUD DE VENTA
// ==========================================================================
window.openNuevaSolicitudVentaModal = function(visitId = null) {
    window.currentSolicitudVentaEditId = null;
    const form = document.getElementById('solicitudVentaForm');
    if (form) form.reset();

    const nextInfo = window.getNextSolicitudVentaNumero();
    document.getElementById('venta_numero').value = nextInfo.numeroSolicitud;
    document.getElementById('venta_fecha_envio').value = new Date().toISOString().split('T')[0];
    document.getElementById('venta_ciudad').value = 'Cuenca';
    document.getElementById('venta_estado').value = 'SOLICITADO';

    window.tempVentaItems = [{ cod: '', desc: '', modelo: '', serie: '' }];
    window.renderVentaRepuestoRows();

    // Rellenar selector de visitas
    renderVentaVisitsSelectorOptions(visitId);
    if (visitId) {
        autoFillVentaFromVisit(visitId);
    }

    const modal = document.getElementById('solicitudVentaModal');
    if (modal) modal.classList.remove('hidden');
};

window.openEditSolicitudVentaModal = function(id) {
    const s = (window.solicitudesVentaArray || []).find(item => item.id === id);
    if (!s) return;

    window.currentSolicitudVentaEditId = id;
    renderVentaVisitsSelectorOptions(s.visitId);

    document.getElementById('venta_visit_selector').value = s.visitId || '';
    document.getElementById('venta_numero').value = s.numeroSolicitud || '';
    document.getElementById('venta_fecha_envio').value = s.fechaEnvio || '';
    document.getElementById('venta_cliente').value = s.cliente || '';
    document.getElementById('venta_telefono').value = s.telefono || '';
    document.getElementById('venta_ciudad').value = s.ciudad || 'Cuenca';
    document.getElementById('venta_direccion').value = s.direccion || '';
    document.getElementById('venta_estado').value = s.estado || 'SOLICITADO';

    if (s.items && s.items.length > 0) {
        window.tempVentaItems = JSON.parse(JSON.stringify(s.items));
    } else {
        window.tempVentaItems = [{
            cod: s.codRepuesto || '',
            desc: s.descRepuesto || '',
            modelo: s.modelo || '',
            serie: s.serie || ''
        }];
    }

    window.renderVentaRepuestoRows();
    window.syncVentaClientPhoneToRows();

    const modal = document.getElementById('solicitudVentaModal');
    if (modal) modal.classList.remove('hidden');
};

window.closeSolicitudVentaModal = function() {
    const modal = document.getElementById('solicitudVentaModal');
    if (modal) modal.classList.add('hidden');
    window.currentSolicitudVentaEditId = null;
    window.tempVentaItems = [];
};

function renderVentaVisitsSelectorOptions(selectedId = null) {
    const selector = document.getElementById('venta_visit_selector');
    if (!selector) return;
    const visits = (typeof window.getVisitsArray === 'function' ? window.getVisitsArray() : window.visitsArray) || [];
    let html = '<option value="">-- SELECCIONAR CLIENTE O VISITA REGISTRADA --</option>';
    visits.forEach(v => {
        const client = v.nombreCliente || 'Sin Cliente';
        const telf = v.telefonoCliente ? ` (${v.telefonoCliente})` : '';
        const eq = (v.equipos && v.equipos[0]) ? ` • ${v.equipos[0].tipo || ''} ${v.equipos[0].marca || ''}` : '';
        const isSel = (v.id === selectedId) ? 'selected' : '';
        html += `<option value="${v.id}" ${isSel}>${client}${telf}${eq}</option>`;
    });
    selector.innerHTML = html;
}

window.autoFillVentaFromVisit = function(visitId) {
    if (!visitId) return;
    const visits = (typeof window.getVisitsArray === 'function' ? window.getVisitsArray() : window.visitsArray) || [];
    const v = visits.find(item => item.id === visitId);
    if (!v) return;

    if (v.nombreCliente) document.getElementById('venta_cliente').value = v.nombreCliente.toUpperCase();
    if (v.telefonoCliente) document.getElementById('venta_telefono').value = v.telefonoCliente;
    if (v.direccionCliente) document.getElementById('venta_direccion').value = v.direccionCliente.toUpperCase();
    if (v.ciudad) document.getElementById('venta_ciudad').value = v.ciudad;

    // Cargar repuestos o equipo si existen en la visita
    if (v.equipos && v.equipos.length > 0) {
        const items = [];
        v.equipos.forEach(eq => {
            const mod = ((eq.tipo || '') + ' ' + (eq.modelo || eq.manualName || '')).trim();
            if (eq.conRepuesto === 'SI' && (eq.codRepuesto || eq.descRepuesto)) {
                items.push({
                    cod: eq.codRepuesto || '',
                    desc: eq.descRepuesto || '',
                    modelo: mod,
                    serie: eq.serie || ''
                });
            } else if (items.length === 0) {
                items.push({
                    cod: '',
                    desc: '',
                    modelo: mod,
                    serie: eq.serie || ''
                });
            }
        });
        if (items.length > 0) {
            window.tempVentaItems = items;
            window.renderVentaRepuestoRows();
        }
    }

    window.syncVentaClientPhoneToRows();
};

// ==========================================================================
// 5. GUARDAR Y ELIMINAR SOLICITUD DE VENTA EN FIREBASE
// ==========================================================================
window.saveSolicitudVentaForm = function() {
    const numInput = document.getElementById('venta_numero').value.trim();
    const clienteInput = document.getElementById('venta_cliente').value.trim().toUpperCase();

    if (!numInput || !clienteInput) {
        if (window.showMessage) window.showMessage('⚠️ Ingrese el N° de solicitud y el nombre del cliente', 'fix-error');
        return;
    }

    let seq = 70;
    const m = numInput.match(/(\d+)/);
    if (m) seq = parseInt(m[1], 10);

    const items = readCurrentVentaRowsFromDOM();
    if (items.length === 0) {
        items.push({ cod: '', desc: '', modelo: '', serie: '' });
    }

    const firstItem = items[0] || {};

    const solicitudObj = {
        numeroSolicitud: numInput,
        numeroSecuencia: seq,
        tipoSolicitud: 'VENTA',
        fechaEnvio: document.getElementById('venta_fecha_envio').value || new Date().toISOString().split('T')[0],
        visitId: document.getElementById('venta_visit_selector')?.value || '',
        cliente: clienteInput,
        telefono: document.getElementById('venta_telefono').value.trim(),
        ciudad: document.getElementById('venta_ciudad').value.trim() || 'Cuenca',
        direccion: document.getElementById('venta_direccion').value.trim().toUpperCase(),
        estado: document.getElementById('venta_estado').value || 'SOLICITADO',
        items: items,
        // Compatibilidad con vistas planas:
        codRepuesto: firstItem.cod || '',
        descRepuesto: firstItem.desc || '',
        modelo: firstItem.modelo || '',
        serie: firstItem.serie || '',
        updatedAt: Date.now()
    };

    const id = window.currentSolicitudVentaEditId;
    let promise;

    if (id) {
        promise = database.ref('solicitudes_venta/' + id).update(solicitudObj);
    } else {
        solicitudObj.createdAt = Date.now();
        const ref = database.ref('solicitudes_venta').push();
        solicitudObj.id = ref.key;
        promise = ref.set(solicitudObj);
    }

    promise.then(() => {
        if (window.showMessage) window.showMessage('💾 Solicitud de Venta archivada exitosamente', 'fix-report');
        closeSolicitudVentaModal();
        renderSolicitudesVentaView();
        if (window.updateGarantiaTabBadges) window.updateGarantiaTabBadges();
    }).catch(err => {
        console.error('Error guardando solicitud de venta:', err);
        if (window.showMessage) window.showMessage('❌ Error al guardar: ' + err.message, 'fix-error');
    });
};

window.deleteSolicitudVenta = function(id) {
    if (window.showConfirmModal) {
        window.showConfirmModal('¿ESTÁ SEGURO DE ELIMINAR ESTA SOLICITUD DE REPUESTO DE VENTA?', function() {
            database.ref('solicitudes_venta/' + id).remove().then(() => {
                if (window.showMessage) window.showMessage('🗑️ Solicitud de Venta eliminada', 'fix-report');
                renderSolicitudesVentaView();
                if (window.updateGarantiaTabBadges) window.updateGarantiaTabBadges();
            });
        });
    } else if (confirm('¿Eliminar esta solicitud de venta?')) {
        database.ref('solicitudes_venta/' + id).remove();
    }
};

window.updateSolicitudVentaEstado = function(id, nuevoEstado) {
    database.ref('solicitudes_venta/' + id).update({ estado: nuevoEstado, updatedAt: Date.now() }).then(() => {
        if (window.showMessage) window.showMessage('Estado actualizado: ' + nuevoEstado, 'fix-accent');
        renderSolicitudesVentaView();
        if (window.updateGarantiaTabBadges) window.updateGarantiaTabBadges();
    });
};

// ==========================================================================
// 6. RENDERIZADO DE LA VISTA PRINCIPAL DE REPUESTOS DE VENTA
// ==========================================================================
window.renderSolicitudesVentaView = function() {
    const listContainer = document.getElementById('solicitudesVentaTableBody');
    if (!listContainer) return;

    const query = (document.getElementById('solicitudesVentaSearchInput')?.value || '').trim().toUpperCase();
    const filterEstado = document.getElementById('solicitudesVentaEstadoFilter')?.value || 'TODOS';

    let list = window.solicitudesVentaArray || [];

    // Filtros
    if (filterEstado !== 'TODOS') {
        list = list.filter(s => s.estado === filterEstado);
    }
    if (query) {
        list = list.filter(s => {
            const inCliente = s.cliente && s.cliente.toUpperCase().includes(query);
            const inNum = s.numeroSolicitud && s.numeroSolicitud.toUpperCase().includes(query);
            const inTelf = s.telefono && s.telefono.includes(query);
            const inItems = (s.items || []).some(it => 
                (it.cod && it.cod.toUpperCase().includes(query)) ||
                (it.desc && it.desc.toUpperCase().includes(query)) ||
                (it.modelo && it.modelo.toUpperCase().includes(query))
            );
            const inCod = s.codRepuesto && s.codRepuesto.toUpperCase().includes(query);
            const inDesc = s.descRepuesto && s.descRepuesto.toUpperCase().includes(query);
            return inCliente || inNum || inTelf || inItems || inCod || inDesc;
        });
    }

    // Mini KPIs
    const all = window.solicitudesVentaArray || [];
    const kpiTotal = all.length;
    let kpiTotalPiezas = 0;
    all.forEach(s => {
        kpiTotalPiezas += (s.items && s.items.length) ? s.items.length : 1;
    });
    const kpiSolicitados = all.filter(s => s.estado === 'SOLICITADO').length;
    const kpiEnviados = all.filter(s => s.estado === 'ENVIADO A FÁBRICA').length;
    const kpiRecibidos = all.filter(s => s.estado === 'REPUESTO RECIBIDO').length;
    const kpiCerrados = all.filter(s => s.estado === 'ENTREGADO AL CLIENTE' || s.estado === 'INSTALADO / CERRADO').length;

    const elKpiTotal = document.getElementById('ventaKpiTotal');
    const elKpiPiezas = document.getElementById('ventaKpiPiezas');
    const elKpiSol = document.getElementById('ventaKpiSolicitados');
    const elKpiEnv = document.getElementById('ventaKpiEnviados');
    const elKpiRec = document.getElementById('ventaKpiRecibidos');
    const elKpiCer = document.getElementById('ventaKpiCerrados');
    const elNextBadge = document.getElementById('ventaNextNumBadge');

    if (elKpiTotal) elKpiTotal.textContent = kpiTotal;
    if (elKpiPiezas) elKpiPiezas.textContent = kpiTotalPiezas;
    if (elKpiSol) elKpiSol.textContent = kpiSolicitados;
    if (elKpiEnv) elKpiEnv.textContent = kpiEnviados;
    if (elKpiRec) elKpiRec.textContent = kpiRecibidos;
    if (elKpiCer) elKpiCer.textContent = kpiCerrados;
    if (elNextBadge) {
        const next = window.getNextSolicitudVentaNumero();
        elNextBadge.textContent = 'PRÓXIMA: N° ' + next.numeroSolicitud;
    }

    if (list.length === 0) {
        listContainer.innerHTML = `<tr><td colspan="7" class="p-12 text-center text-stone-400 font-black uppercase italic">No hay solicitudes de repuestos de venta registradas con estos filtros</td></tr>`;
        return;
    }

    listContainer.innerHTML = list.map(s => {
        let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
        if (s.estado === 'ENVIADO A FÁBRICA') badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
        if (s.estado === 'REPUESTO RECIBIDO') badgeColor = 'bg-purple-100 text-purple-900 border-purple-300';
        if (s.estado === 'ENTREGADO AL CLIENTE' || s.estado === 'INSTALADO / CERRADO') badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';

        const items = (s.items && s.items.length > 0) ? s.items : [{ cod: s.codRepuesto, desc: s.descRepuesto, modelo: s.modelo }];
        const itemCount = items.length;

        const itemsSummaryHtml = items.map((it, idx) => {
            return `
                <div class="text-[11px] leading-tight pb-1 border-b border-stone-100 last:border-0 last:pb-0">
                    <span class="font-mono font-black text-amber-900">${it.cod || 'S/C'}</span> • 
                    <span class="font-bold text-slate-800 uppercase">${it.desc || 'REPUESTO'}</span> 
                    ${it.modelo ? `<span class="text-stone-400 text-[10px] font-medium font-mono">[${it.modelo}]</span>` : ''}
                </div>
            `;
        }).join('');

        return `
            <tr class="border-b border-stone-200/70 hover:bg-amber-50/30 transition-colors font-medium text-xs text-stone-800">
                <td class="p-3.5 text-center font-mono font-black text-amber-950">
                    <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 block mb-1">${s.numeroSolicitud || '---'}</span>
                    <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">🛒 Venta</span>
                </td>
                <td class="p-3.5 font-mono text-[11px] text-stone-600 whitespace-nowrap text-center">
                    ${s.fechaEnvio || '---'}
                </td>
                <td class="p-3.5">
                    <p class="font-black text-slate-900 uppercase text-xs">${s.cliente || '---'}</p>
                    <p class="text-[10px] text-stone-500 font-mono">📞 ${s.telefono || '---'} • 📍 ${s.ciudad || 'Cuenca'}</p>
                </td>
                <td class="p-3.5 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-mono font-black ${itemCount > 1 ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-stone-100 text-stone-800'}">
                        ${itemCount} ${itemCount === 1 ? 'pieza' : 'piezas'}
                    </span>
                </td>
                <td class="p-3.5 max-w-md">
                    <div class="space-y-1">
                        ${itemsSummaryHtml}
                    </div>
                </td>
                <td class="p-3.5 text-center">
                    <select onchange="updateSolicitudVentaEstado('${s.id}', this.value)" class="p-1.5 rounded-lg text-[10px] font-black uppercase border ${badgeColor} shadow-2xs outline-none cursor-pointer">
                        <option value="SOLICITADO" ${s.estado === 'SOLICITADO' ? 'selected' : ''}>⏳ SOLICITADO / ESPERA</option>
                        <option value="ENVIADO A FÁBRICA" ${s.estado === 'ENVIADO A FÁBRICA' ? 'selected' : ''}>📤 ENVIADO A FÁBRICA</option>
                        <option value="REPUESTO RECIBIDO" ${s.estado === 'REPUESTO RECIBIDO' ? 'selected' : ''}>📦 RECIBIDO EN FIX</option>
                        <option value="ENTREGADO AL CLIENTE" ${s.estado === 'ENTREGADO AL CLIENTE' ? 'selected' : ''}>✅ ENTREGADO / CERRADO</option>
                    </select>
                </td>
                <td class="p-3.5 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5">
                        <button type="button" onclick="downloadSolicitudVentaExcelFromList('${s.id}')" class="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase shadow-xs transition-all active:scale-95 flex items-center gap-1" title="Descargar Excel Exacto de Venta (.xlsx)">
                            <span>📊</span> <span>Excel</span>
                        </button>
                        <button type="button" onclick="openEmailModalForVenta('${s.id}')" class="p-2 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer" title="Preparar Correo TEKA">
                            <span>✉️</span> <span class="hidden xl:inline text-[10px]">Gmail</span>
                        </button>
                        <button type="button" onclick="openEditSolicitudVentaModal('${s.id}')" class="p-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-black shadow-xs transition-all" title="Editar Solicitud">
                            ✏️
                        </button>
                        <button type="button" onclick="deleteSolicitudVenta('${s.id}')" class="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-black shadow-xs transition-all" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

window.openEmailModalForVenta = async function(id) {
    const s = (window.solicitudesVentaArray || []).find(item => item.id === id);
    if (!s) return;

    if (window.openEmailModal) {
        // Adaptar objeto temporalmente para usar la interfaz de correo existente si está disponible
        window.openEmailModal(id, s);
    } else {
        // Descargar directo
        window.generateExcelVenta(s);
    }
};

window.downloadCurrentVentaExcelDirect = function() {
    const numInput = document.getElementById('venta_numero').value.trim();
    const clienteInput = document.getElementById('venta_cliente').value.trim().toUpperCase();
    if (!numInput || !clienteInput) {
        if (window.showMessage) window.showMessage('⚠️ Ingrese el N° de solicitud y el nombre del cliente para generar el Excel', 'fix-error');
        return;
    }
    const items = readCurrentVentaRowsFromDOM();
    const data = {
        numeroSolicitud: numInput,
        cliente: clienteInput,
        telefono: document.getElementById('venta_telefono').value.trim(),
        fechaEnvio: document.getElementById('venta_fecha_envio').value || new Date().toISOString().split('T')[0],
        ciudad: document.getElementById('venta_ciudad').value.trim() || 'Cuenca',
        direccion: document.getElementById('venta_direccion').value.trim().toUpperCase(),
        items: items
    };
    window.generateExcelVenta(data);
};
