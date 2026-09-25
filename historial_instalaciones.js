/**
 * HISTORIAL DE INSTALACIONES (2023 - 2026 + EN VIVO FIX)
 * Motor unificado de consulta y búsqueda multi-criterio en tiempo real.
 */

(function() {
    // Estado del módulo
    let currentFilterResults = [];
    let currentPage = 1;
    let pageSize = 50;
    let selectedRecord = null;
    let searchDebounceTimer = null;

    // Quitar acentos para comparaciones uniformes
    function stripAccents(str) {
        if (!str) return '';
        return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    // Obtener lista unificada (Historial 2023-2026 + Visitas en vivo de FIX)
    window.getUnifiedInstallationsList = function() {
        const historical = window.HISTORIAL_INSTALACIONES_2023_2026 || [];
        const liveVisits = window.visitsArray || [];

        // Mapear visitas en vivo de FIX al formato común
        const liveMapped = liveVisits.map(v => {
            const series = (v.equipos && v.equipos.length)
                ? v.equipos.map(e => e.serie || '').filter(Boolean).join(', ')
                : (v.serie || '');
            const codigos = (v.equipos && v.equipos.length)
                ? v.equipos.map(e => e.codigo || '').filter(Boolean).join(', ')
                : (v.codigo || '');
            const desc = (v.equipos && v.equipos.length)
                ? v.equipos.map(e => [e.tipo, e.marca, e.modelo].filter(Boolean).join(' ')).filter(Boolean).join('; ')
                : (v.producto || v.modelo || '');

            const fechaInst = v.fechaInstalacion || v.fechaVisita || v.fechaEmision || '';
            const fechaCompra = v.fechaEmision || '';

            return {
                f: fechaInst,
                fc: fechaCompra,
                cl: (v.nombreCliente || v.cliente || '').trim(),
                ci: (v.cedula || '').trim(),
                fac: (v.numFactura || '').trim(),
                se: series,
                co: codigos,
                de: desc,
                te: (v.tecnico || '').trim(),
                ciu: (v.ciudad || '').trim(),
                dir: (v.callePrincipal || v.direccion || '').trim(),
                tel: (v.telefono || '').trim(),
                cor: (v.email || '').trim(),
                lug: (v.lugarCompra || '').trim(),
                gar: (v.tipoAtencion || 'Instalación').trim(),
                obs: (v.observacionesAdmin || v.observaciones || '').trim(),
                pr: (v.financiera && v.financiera.totalCliente) ? String(v.financiera.totalCliente) : '',
                est: (v.estado || 'PENDIENTE').trim(),
                ao: 'Sistema FIX (En Vivo)',
                ho: (v.tipoAtencion || 'Visita').toUpperCase(),
                fo: 0,
                origen: 'FIX_LIVE',
                visitId: v.id,
                rawVisit: v
            };
        });

        // Marcar origen en los históricos
        const histMapped = historical.map(h => {
            if (!h.origen) h.origen = 'HISTORICO';
            return h;
        });

        // Unificar ambas listas
        return [...liveMapped, ...histMapped];
    };

    // Búsqueda y filtrado multi-criterio
    window.performHistorialSearch = function(resetPage = true) {
        if (resetPage) currentPage = 1;

        const globalInput = document.getElementById('historialGlobalSearch');
        const qRaw = globalInput ? globalInput.value : '';
        const qNorm = stripAccents(qRaw);
        const qTokens = qNorm.split(/\s+/).filter(Boolean);

        const fStart = document.getElementById('historialFilterDateStart') ? document.getElementById('historialFilterDateStart').value : '';
        const fEnd = document.getElementById('historialFilterDateEnd') ? document.getElementById('historialFilterDateEnd').value : '';
        const fFactura = stripAccents(document.getElementById('historialFilterFactura') ? document.getElementById('historialFilterFactura').value : '');
        const fCedula = stripAccents(document.getElementById('historialFilterCedula') ? document.getElementById('historialFilterCedula').value : '');
        const fSerie = stripAccents(document.getElementById('historialFilterSerie') ? document.getElementById('historialFilterSerie').value : '');
        const fCodigo = stripAccents(document.getElementById('historialFilterCodigo') ? document.getElementById('historialFilterCodigo').value : '');
        const fCliente = stripAccents(document.getElementById('historialFilterCliente') ? document.getElementById('historialFilterCliente').value : '');
        const fTelefono = stripAccents(document.getElementById('historialFilterTelefono') ? document.getElementById('historialFilterTelefono').value : '');
        const fTecnico = stripAccents(document.getElementById('historialFilterTecnico') ? document.getElementById('historialFilterTecnico').value : '');
        const fCiudad = stripAccents(document.getElementById('historialFilterCiudad') ? document.getElementById('historialFilterCiudad').value : '');
        const fOrigen = document.getElementById('historialFilterOrigen') ? document.getElementById('historialFilterOrigen').value : 'TODOS';

        const allRecords = window.getUnifiedInstallationsList();

        currentFilterResults = allRecords.filter(item => {
            // Filtro por Origen
            if (fOrigen === 'HISTORICO' && item.origen !== 'HISTORICO') return false;
            if (fOrigen === 'FIX_LIVE' && item.origen !== 'FIX_LIVE') return false;

            // Filtro por Fechas
            if (fStart && (!item.f || item.f < fStart)) return false;
            if (fEnd && (!item.f || item.f > fEnd)) return false;

            // Filtros específicos
            if (fFactura && !stripAccents(item.fac).includes(fFactura)) return false;
            if (fCedula && !stripAccents(item.ci).includes(fCedula)) return false;
            if (fSerie && !stripAccents(item.se).includes(fSerie)) return false;
            if (fCodigo && !stripAccents(item.co).includes(fCodigo)) return false;
            if (fCliente && !stripAccents(item.cl).includes(fCliente)) return false;
            if (fTelefono && !stripAccents(item.tel).includes(fTelefono)) return false;
            if (fTecnico && !stripAccents(item.te).includes(fTecnico)) return false;
            if (fCiudad && !stripAccents(item.ciu).includes(fCiudad)) return false;

            // Búsqueda global multi-token (todas las palabras deben coincidir)
            if (qTokens.length > 0) {
                const combined = stripAccents(
                    [
                        item.f, item.fc, item.cl, item.ci, item.fac,
                        item.se, item.co, item.de, item.te, item.ciu,
                        item.dir, item.tel, item.cor, item.lug, item.obs,
                        item.est, item.ao, item.ho
                    ].join(' ')
                );
                for (let i = 0; i < qTokens.length; i++) {
                    if (!combined.includes(qTokens[i])) return false;
                }
            }

            return true;
        });

        renderHistorialTable();
        renderHistorialKPIs(allRecords, currentFilterResults);
    };

    // Debounce para búsqueda mientras escribe
    window.onHistorialSearchInput = function() {
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            window.performHistorialSearch(true);
        }, 180);
    };

    // Limpiar todos los filtros
    window.clearHistorialFilters = function() {
        const ids = [
            'historialGlobalSearch', 'historialFilterDateStart', 'historialFilterDateEnd',
            'historialFilterFactura', 'historialFilterCedula', 'historialFilterSerie',
            'historialFilterCodigo', 'historialFilterCliente', 'historialFilterTelefono',
            'historialFilterTecnico', 'historialFilterCiudad'
        ];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const orig = document.getElementById('historialFilterOrigen');
        if (orig) orig.value = 'TODOS';

        window.performHistorialSearch(true);
    };

    // Alternar panel de filtros avanzados
    window.toggleHistorialAdvancedFilters = function() {
        const panel = document.getElementById('historialAdvancedFiltersPanel');
        const icon = document.getElementById('historialFilterToggleIcon');
        const text = document.getElementById('historialFilterToggleText');
        if (!panel) return;

        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            if (icon) icon.textContent = '▲';
            if (text) text.textContent = 'Ocultar Filtros';
        } else {
            panel.classList.add('hidden');
            if (icon) icon.textContent = '⚙️';
            if (text) text.textContent = 'Filtros Específicos';
        }
    };

    // Renderizar KPIs
    function renderHistorialKPIs(allRecords, filtered) {
        const totalUnified = allRecords.length;
        const totalFiltered = filtered.length;

        const countTotalEl = document.getElementById('historialKpiTotal');
        const countFilteredEl = document.getElementById('historialKpiFiltered');
        const countHistEl = document.getElementById('historialKpiHistorico');
        const countLiveEl = document.getElementById('historialKpiLive');
        const tableCountBadge = document.getElementById('historialTableCountBadge');

        if (countTotalEl) countTotalEl.textContent = totalUnified.toLocaleString('es-EC');
        if (countFilteredEl) countFilteredEl.textContent = totalFiltered.toLocaleString('es-EC');

        const histCount = allRecords.filter(r => r.origen === 'HISTORICO').length;
        const liveCount = allRecords.filter(r => r.origen === 'FIX_LIVE').length;

        if (countHistEl) countHistEl.textContent = histCount.toLocaleString('es-EC');
        if (countLiveEl) countLiveEl.textContent = liveCount.toLocaleString('es-EC');
        if (tableCountBadge) tableCountBadge.textContent = `${totalFiltered.toLocaleString('es-EC')} registros encontrados`;

        // Métricas de desglose por año
        const yearsCounter = {};
        allRecords.forEach(r => {
            if (r.f && r.f.length >= 4) {
                const y = r.f.substring(0, 4);
                if (/^\d{4}$/.test(y)) {
                    yearsCounter[y] = (yearsCounter[y] || 0) + 1;
                }
            }
        });

        const yearListEl = document.getElementById('historialKpiYearList');
        if (yearListEl) {
            const sortedYears = Object.keys(yearsCounter).sort().reverse();
            yearListEl.innerHTML = sortedYears.slice(0, 4).map(y => `
                <div class="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5 last:border-b-0">
                    <span class="text-slate-400 font-bold">Año ${y}</span>
                    <span class="font-mono font-black text-sky-400">${yearsCounter[y].toLocaleString('es-EC')}</span>
                </div>
            `).join('');
        }

        // Top Técnicos
        const techCounter = {};
        allRecords.forEach(r => {
            const t = (r.te || '').trim().toUpperCase();
            if (t && t !== 'CAPELO' && t !== 'TECNICO' && t !== '-') {
                techCounter[t] = (techCounter[t] || 0) + 1;
            } else if (t === 'CAPELO') {
                techCounter['CRISTIAN CAPELO'] = (techCounter['CRISTIAN CAPELO'] || 0) + 1;
            }
        });

        const techListEl = document.getElementById('historialKpiTechList');
        if (techListEl) {
            const sortedTechs = Object.entries(techCounter).sort((a, b) => b[1] - a[1]);
            techListEl.innerHTML = sortedTechs.slice(0, 4).map(([t, c]) => `
                <div class="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5 last:border-b-0">
                    <span class="text-slate-300 font-bold truncate max-w-[130px]" title="${t}">🔧 ${t}</span>
                    <span class="font-mono font-black text-emerald-400">${c.toLocaleString('es-EC')}</span>
                </div>
            `).join('');
        }

        // Top Productos / Códigos
        const prodCounter = {};
        allRecords.forEach(r => {
            const co = (r.co || '').trim();
            if (co && co.length > 3) {
                const label = `${co} - ${(r.de || 'Equipo TEKA').substring(0, 24)}`;
                prodCounter[label] = (prodCounter[label] || 0) + 1;
            }
        });

        const prodListEl = document.getElementById('historialKpiProdList');
        if (prodListEl) {
            const sortedProds = Object.entries(prodCounter).sort((a, b) => b[1] - a[1]);
            prodListEl.innerHTML = sortedProds.slice(0, 4).map(([p, c]) => `
                <div class="flex items-center justify-between text-[11px] py-0.5 border-b border-white/5 last:border-b-0">
                    <span class="text-slate-300 font-bold truncate max-w-[140px]" title="${p}">📦 ${p}</span>
                    <span class="font-mono font-black text-purple-400">${c.toLocaleString('es-EC')}</span>
                </div>
            `).join('');
        }
    }

    // Renderizar Tabla de Resultados
    function renderHistorialTable() {
        const tbody = document.getElementById('historialTableBody');
        const emptyState = document.getElementById('historialEmptyState');
        const paginationArea = document.getElementById('historialPaginationArea');
        const pageIndicator = document.getElementById('historialPageIndicator');
        const btnPrev = document.getElementById('historialBtnPrev');
        const btnNext = document.getElementById('historialBtnNext');

        if (!tbody) return;

        const totalItems = currentFilterResults.length;
        if (totalItems === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            if (paginationArea) paginationArea.classList.add('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        if (paginationArea) paginationArea.classList.remove('hidden');

        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const pageItems = currentFilterResults.slice(startIndex, endIndex);

        let html = '';
        pageItems.forEach((r, idx) => {
            const isLive = (r.origen === 'FIX_LIVE');
            const origenBadge = isLive
                ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>FIX EN VIVO</span>`
                : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-sky-500/20 text-sky-200 border border-sky-500/30" title="${r.ao} | Hoja: ${r.ho}">🏛️ ${r.f ? r.f.substring(0,4) : 'HISTÓRICO'}</span>`;

            const clientName = r.cl || '<span class="text-slate-500 italic">No especificado</span>';
            const cedula = r.ci || '<span class="text-slate-500 italic">---</span>';
            const factura = r.fac || '<span class="text-slate-500 italic">---</span>';
            const serie = r.se || '<span class="text-slate-500 italic">---</span>';
            const codigo = r.co || '<span class="text-slate-500 italic">---</span>';
            const desc = r.de || '<span class="text-slate-500 italic">---</span>';
            const tech = r.te || '<span class="text-slate-500 italic">---</span>';
            const ciudad = r.ciu || '<span class="text-slate-500 italic">---</span>';

            html += `
                <tr onclick="openHistorialDetailModalByIndex(${startIndex + idx})" class="hover:bg-sky-500/10 transition-colors cursor-pointer border-b border-white/5 text-xs text-slate-200 group">
                    <td class="p-3 text-center">${origenBadge}</td>
                    <td class="p-3 font-mono font-bold text-slate-300 whitespace-nowrap">${r.f || '---'}</td>
                    <td class="p-3 font-bold text-white group-hover:text-sky-300 transition-colors">${clientName}</td>
                    <td class="p-3 font-mono text-[11px] text-slate-300">${cedula}</td>
                    <td class="p-3 font-mono text-[11px] text-amber-300/90 whitespace-nowrap">${factura}</td>
                    <td class="p-3 font-mono text-[11px] text-sky-300 whitespace-nowrap">${serie}</td>
                    <td class="p-3 font-mono text-[11px] text-purple-300">${codigo}</td>
                    <td class="p-3 max-w-[200px] truncate text-slate-300" title="${r.de || ''}">${desc}</td>
                    <td class="p-3 text-slate-300 whitespace-nowrap">🔧 ${tech}</td>
                    <td class="p-3 text-slate-400 whitespace-nowrap">${ciudad}</td>
                    <td class="p-3 text-center">
                        <button type="button" class="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 text-sky-200 text-[10px] font-bold border border-sky-400/30 transition-all">
                            Detalles 🔍
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Actualizar paginación
        if (pageIndicator) {
            pageIndicator.textContent = `Página ${currentPage} de ${totalPages} (${startIndex + 1}-${endIndex} de ${totalItems.toLocaleString('es-EC')})`;
        }
        if (btnPrev) btnPrev.disabled = (currentPage === 1);
        if (btnNext) btnNext.disabled = (currentPage === totalPages);
    }

    // Cambiar página
    window.historialChangePage = function(delta) {
        currentPage += delta;
        renderHistorialTable();
        // Scroll suave hacia la tabla
        const tableContainer = document.getElementById('historialTableContainer');
        if (tableContainer) tableContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Modal de Detalle Completo
    window.openHistorialDetailModalByIndex = function(index) {
        if (index < 0 || index >= currentFilterResults.length) return;
        window.openHistorialDetailModal(currentFilterResults[index]);
    };

    window.openHistorialDetailModal = function(r) {
        selectedRecord = r;
        const modal = document.getElementById('modalHistorialDetalle');
        if (!modal) return;

        const isLive = (r.origen === 'FIX_LIVE');

        // Encabezado
        const titleEl = document.getElementById('histModalTitle');
        const subDateEl = document.getElementById('histModalDateSub');
        const metaBoxEl = document.getElementById('histModalMetaBox');
        const liveActionBtn = document.getElementById('histModalLiveActionBtn');

        if (titleEl) titleEl.textContent = r.cl || 'Detalle de Instalación';
        if (subDateEl) subDateEl.textContent = `Fecha de Instalación: ${r.f || 'No especificada'} | Compra: ${r.fc || 'No especificada'}`;

        // Metadatos de origen
        if (metaBoxEl) {
            if (isLive) {
                metaBoxEl.className = "p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-200";
                metaBoxEl.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-black uppercase tracking-wider text-emerald-300">⚡ Servicio En Vivo en FIX</span><br>
                            <span class="text-[11px] text-emerald-200/80">ID de Visita: <strong class="font-mono text-white">${r.visitId || '---'}</strong> | Tipo: <strong>${r.gar || 'Visita'}</strong> | Estado: <span class="px-1.5 py-0.2 rounded bg-emerald-600/30 font-bold">${r.est || 'PENDIENTE'}</span></span>
                        </div>
                    </div>
                `;
            } else {
                metaBoxEl.className = "p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-xs text-slate-300";
                metaBoxEl.innerHTML = `
                    <div>
                        <span class="font-black uppercase tracking-wider text-sky-400">🏛️ Archivo Histórico Consolidado 2023-2026</span><br>
                        <span class="text-[11px] text-slate-300">Archivo Excel: <strong class="text-white font-mono">${r.ao || '---'}</strong></span><br>
                        <span class="text-[11px] text-slate-400">Hoja: <strong class="text-white font-mono">${r.ho || '---'}</strong> | Fila Original en Excel: <strong class="text-amber-300 font-mono">#${r.fo || '---'}</strong></span>
                    </div>
                `;
            }
        }

        // Botón de acción para registros en vivo
        if (liveActionBtn) {
            if (isLive && r.visitId) {
                liveActionBtn.classList.remove('hidden');
                liveActionBtn.onclick = function() {
                    window.closeHistorialDetailModal();
                    if (window.changeMasterView) window.changeMasterView('reporte_admin');
                    setTimeout(() => {
                        if (window.editVisit) window.editVisit(r.visitId);
                    }, 100);
                };
            } else {
                liveActionBtn.classList.add('hidden');
            }
        }

        // Llenar campos principales
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val || '---';
        };

        setVal('histDetCliente', r.cl);
        setVal('histDetCedula', r.ci);
        setVal('histDetFactura', r.fac);
        setVal('histDetFechaInst', r.f);
        setVal('histDetFechaCompra', r.fc);
        setVal('histDetSerie', r.se);
        setVal('histDetCodigo', r.co);
        setVal('histDetTelefono', r.tel);
        setVal('histDetCorreo', r.cor);
        setVal('histDetCiudad', r.ciu);
        setVal('histDetDireccion', r.dir);
        setVal('histDetTecnico', r.te);
        setVal('histDetLugarCompra', r.lug);
        setVal('histDetGarantia', r.gar);
        setVal('histDetPrecio', r.pr ? `$${r.pr}` : '---');
        setVal('histDetEstado', r.est);
        setVal('histDetDescripcion', r.de);
        setVal('histDetObservaciones', r.obs);

        // Campos adicionales de Excel (x)
        const rawContent = document.getElementById('histModalRawContent');
        const rawTrigger = document.getElementById('histModalRawTrigger');
        const rawArrow = document.getElementById('histModalRawArrow');

        if (rawContent) {
            rawContent.innerHTML = '';
            rawContent.classList.add('hidden');
            if (rawArrow) rawArrow.textContent = '▼';

            const extra = r.x || {};
            const keys = Object.keys(extra);
            if (keys.length > 0) {
                if (rawTrigger) rawTrigger.classList.remove('hidden');
                let extraHtml = '<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/5">';
                keys.forEach(k => {
                    extraHtml += `
                        <div class="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                            <div class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">${k}</div>
                            <div class="text-xs font-mono text-slate-200 break-words mt-0.5">${extra[k]}</div>
                        </div>
                    `;
                });
                extraHtml += '</div>';
                rawContent.innerHTML = extraHtml;
            } else {
                if (rawTrigger) rawTrigger.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');
    };

    window.closeHistorialDetailModal = function() {
        const modal = document.getElementById('modalHistorialDetalle');
        if (modal) modal.classList.add('hidden');
    };

    window.toggleHistorialRawContent = function() {
        const rawContent = document.getElementById('histModalRawContent');
        const rawArrow = document.getElementById('histModalRawArrow');
        if (!rawContent) return;

        if (rawContent.classList.contains('hidden')) {
            rawContent.classList.remove('hidden');
            if (rawArrow) rawArrow.textContent = '▲';
        } else {
            rawContent.classList.add('hidden');
            if (rawArrow) rawArrow.textContent = '▼';
        }
    };

    // Exportar Resultados a CSV
    window.exportHistorialToCSV = function() {
        const rows = currentFilterResults;
        if (!rows || rows.length === 0) {
            if (window.showMessage) window.showMessage("⚠️ No hay registros coincidentes para exportar.", "fix-error");
            return;
        }

        const headers = [
            "Origen", "Fecha_Instalacion", "Fecha_Compra", "Cliente", "Cedula_RUC",
            "Factura", "Serie", "Codigo_Producto", "Descripcion", "Tecnico",
            "Ciudad", "Direccion", "Telefono", "Correo", "Lugar_Compra",
            "Garantia", "Precio", "Estado", "Observaciones", "Archivo_Origen", "Hoja_Origen", "Fila_Excel"
        ];

        const csvRows = [headers.join(",")];

        rows.forEach(r => {
            const values = [
                r.origen === 'FIX_LIVE' ? 'FIX EN VIVO' : 'HISTORICO',
                r.f || '',
                r.fc || '',
                r.cl || '',
                r.ci || '',
                r.fac || '',
                r.se || '',
                r.co || '',
                r.de || '',
                r.te || '',
                r.ciu || '',
                r.dir || '',
                r.tel || '',
                r.cor || '',
                r.lug || '',
                r.gar || '',
                r.pr || '',
                r.est || '',
                r.obs || '',
                r.ao || '',
                r.ho || '',
                r.fo || ''
            ].map(val => {
                const s = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
                return `"${s}"`;
            });
            csvRows.push(values.join(","));
        });

        // BOM UTF-8 para apertura correcta en Excel en español
        const csvContent = "\uFEFF" + csvRows.join("\r\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const today = new Date().toISOString().split('T')[0];
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `consulta_instalaciones_teka_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (window.showMessage) {
            window.showMessage(`📥 Exportados ${rows.length.toLocaleString('es-EC')} registros a CSV`, "fix-report");
        }
    };

    // Renderizar la vista principal
    window.renderHistorialInstalacionesView = function() {
        window.performHistorialSearch(false);
    };

    // Inicializar eventos de teclas al cargar el DOM
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('historialGlobalSearch');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    window.performHistorialSearch(true);
                }
            });
        }
    });

})();
