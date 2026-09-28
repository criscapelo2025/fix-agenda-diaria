/**
 * MOTOR DE CONSULTA Y BÚSQUEDA DE ERRORES Y CONFIGURACIÓN DE INDUCCIÓN TEKA
 * Fuente: Nota Técnica NTEH15017 ES
 */

(function() {
    let activeSubTab = 'errores'; // 'errores' | 'modelos' | 'touch' | 'modulos'
    let currentErrorFilter = 'all'; // 'all' | 'F' | 'C' | comp_name
    let searchDebounceTimer = null;

    // Quitar acentos y normalizar
    function cleanStr(s) {
        if (!s) return '';
        return String(s)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    // Inicializar módulo al cambiar a la vista
    window.renderCodigosErrorView = function() {
        const container = document.getElementById('codigosErrorView');
        if (!container) return;

        // Si ya está montada la estructura básica, solo actualizamos los datos
        if (!document.getElementById('codigosInduccionSearchInput')) {
            buildModuleLayout(container);
        }

        applySearchAndFilters();
    };

    // Cambiar de subpestaña (Errores, Modelos, Touch Controls, Módulos)
    window.switchCodigosSubTab = function(tabName) {
        activeSubTab = tabName;
        ['errores', 'modelos', 'touch', 'modulos'].forEach(t => {
            const btn = document.getElementById('tabBtn_ci_' + t);
            const panel = document.getElementById('panel_ci_' + t);
            if (btn) {
                if (t === tabName) {
                    btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
                    btn.classList.remove('bg-slate-800', 'text-slate-300', 'hover:bg-slate-700');
                } else {
                    btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
                    btn.classList.add('bg-slate-800', 'text-slate-300', 'hover:bg-slate-700');
                }
            }
            if (panel) {
                if (t === tabName) panel.classList.remove('hidden');
                else panel.classList.add('hidden');
            }
        });
        applySearchAndFilters();
    };

    // Filtros rápidos de errores (Todos, Fallas F, Avisos C)
    window.filterErroresByChip = function(type, btnEl) {
        currentErrorFilter = type;
        document.querySelectorAll('.ci-chip-btn').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white', 'border-blue-400');
            b.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
        });
        if (btnEl) {
            btnEl.classList.add('bg-blue-600', 'text-white', 'border-blue-400');
            btnEl.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');
        }
        renderErroresList();
    };

    // Estructura visual principal del módulo
    function buildModuleLayout(container) {
        container.innerHTML = `
            <div class="space-y-4 font-sans text-slate-100">
                <!-- BANNER HEADER -->
                <div class="glass-card p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900 via-blue-950/70 to-slate-900 relative overflow-hidden">
                    <div class="absolute -right-8 -top-8 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                        <div>
                            <div class="flex items-center gap-2 flex-wrap mb-1.5">
                                <span class="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
                                    TEKA OFICIAL NTEH15017
                                </span>
                                <span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Generaciones G0 • G1 • G1+ • G2 • G3
                                </span>
                                <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                                    35 Errores • 185 Modelos
                                </span>
                            </div>
                            <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                <span>⚡</span>
                                <span>Códigos de Error y Configuración de Inducción</span>
                            </h2>
                            <p class="text-xs text-slate-300 font-normal mt-1 max-w-2xl leading-relaxed">
                                Diagnóstico rápido de fallas electrónicas, consulta de códigos de configuración por modelo y guía paso a paso de los Touch Controls TEKA.
                            </p>
                        </div>

                        <!-- Botón abrir PDF original -->
                        <div class="flex items-center gap-2 shrink-0">
                            <a href="erores%20y%20codigos%20INDUCCION.pdf" target="_blank" download class="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-blue-300 border border-blue-400/30 text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer" title="Descargar o Ver Documento PDF Original">
                                <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <span>Ver PDF Oficial</span>
                            </a>
                        </div>
                    </div>

                    <!-- BUSCADOR PRINCIPAL REACTIVO -->
                    <div class="mt-4 pt-4 border-t border-slate-800/80">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                            <input 
                                type="text" 
                                id="codigosInduccionSearchInput" 
                                oninput="window.onCodigosSearchInput(this.value)"
                                placeholder="🔍 Escribe código de error (ej. F05, F47, C81), modelo (ej. IZ 6420, IB 641) o componente (IGBT, bobina, fusible)..." 
                                class="w-full pl-11 pr-24 py-3 bg-slate-950/80 border border-blue-500/40 rounded-2xl text-xs sm:text-sm font-semibold text-white placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                            >
                            <button 
                                type="button" 
                                onclick="window.clearCodigosSearch()" 
                                id="btnClearCodigosSearch"
                                class="hidden absolute inset-y-0 right-2 my-auto h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
                            >
                                ✕ Limpiar
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
                            <span id="ciSearchResultsSummary">Cargando catálogo técnico...</span>
                            <span class="text-[10px] text-slate-500 hidden sm:inline">Presiona ESC o ✕ para reiniciar la búsqueda</span>
                        </div>
                    </div>

                    <!-- SUBPESTAÑAS DE NAVEGACIÓN -->
                    <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/80">
                        <button type="button" onclick="switchCodigosSubTab('errores')" id="tabBtn_ci_errores" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-blue-600 text-white shadow-md cursor-pointer">
                            <span>🚨</span>
                            <span>Códigos de Error (${(window.TEKA_INDUCTION_ERRORS || []).length})</span>
                        </button>
                        <button type="button" onclick="switchCodigosSubTab('modelos')" id="tabBtn_ci_modelos" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
                            <span>🍳</span>
                            <span>Modelos y Configuración (${(window.TEKA_INDUCTION_MODELS || []).length})</span>
                        </button>
                        <button type="button" onclick="switchCodigosSubTab('touch')" id="tabBtn_ci_touch" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
                            <span>🎛️</span>
                            <span>Guía Touch Controls (9 Tipos)</span>
                        </button>
                        <button type="button" onclick="switchCodigosSubTab('modulos')" id="tabBtn_ci_modulos" class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer">
                            <span>📦</span>
                            <span>Módulos de Inducción</span>
                        </button>
                    </div>
                </div>

                <!-- CONTENEDOR 1: CÓDIGOS DE ERROR -->
                <div id="panel_ci_errores" class="space-y-4">
                    <!-- CHIPS DE FILTRO RÁPIDO -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Filtro:</span>
                        <button type="button" onclick="filterErroresByChip('all', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-blue-600 text-white border border-blue-400 shrink-0 cursor-pointer transition-all">
                            Todos (35)
                        </button>
                        <button type="button" onclick="filterErroresByChip('F', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-all">
                            🚨 Fallas F (28)
                        </button>
                        <button type="button" onclick="filterErroresByChip('C', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-all">
                            ⚠️ Avisos C (7)
                        </button>
                        <button type="button" onclick="filterErroresByChip('Generador', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-all">
                            Generador
                        </button>
                        <button type="button" onclick="filterErroresByChip('Red', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-all">
                            Tensión / Red
                        </button>
                        <button type="button" onclick="filterErroresByChip('Bobina', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-all">
                            Bobina / Sensor
                        </button>
                        <button type="button" onclick="filterErroresByChip('Touch', this)" class="ci-chip-btn px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer transition-all">
                            Touch Control
                        </button>
                    </div>

                    <!-- GRID DE TARJETAS DE ERRORES -->
                    <div id="ciErroresListGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        <!-- Renderizado dinámico -->
                    </div>
                </div>

                <!-- CONTENEDOR 2: MODELOS Y CÓDIGOS DE CONFIGURACIÓN -->
                <div id="panel_ci_modelos" class="hidden space-y-4">
                    <div class="glass-card p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Listado de 185 modelos con código de producto, generación, tipo de control y código de configuración exacto.</span>
                        </div>
                    </div>
                    <div class="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl bg-slate-900/90">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                    <th class="p-3 w-28">Cód. Producto</th>
                                    <th class="p-3">Modelo</th>
                                    <th class="p-3 w-28">Generación</th>
                                    <th class="p-3 w-32">Touch Control</th>
                                    <th class="p-3 w-24 text-center">Cód. Conf.</th>
                                    <th class="p-3 w-36 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="ciModelosTableBody" class="divide-y divide-slate-800/60 font-medium">
                                <!-- Renderizado dinámico -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- CONTENEDOR 3: GUÍA TOUCH CONTROLS -->
                <div id="panel_ci_touch" class="hidden space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="ciTouchControlsGrid">
                        <!-- Renderizado dinámico -->
                    </div>
                </div>

                <!-- CONTENEDOR 4: MÓDULOS DE INDUCCIÓN -->
                <div id="panel_ci_modulos" class="hidden space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="ciModulosGrid">
                        <!-- Renderizado dinámico -->
                    </div>
                </div>
            </div>

            <!-- MODAL DE DETALLE DE ERROR O TOUCH CONTROL -->
            <div id="ciDetailModal" class="hidden fixed inset-0 z-[25000] modal-overlay flex items-center justify-center p-3 font-sans">
                <div class="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95">
                    <button type="button" onclick="window.closeCiDetailModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
                        ✕
                    </button>
                    <div id="ciModalBodyContent"></div>
                </div>
            </div>
        `;
    }

    // Input reactivo con debounce
    window.onCodigosSearchInput = function(val) {
        clearTimeout(searchDebounceTimer);
        const clearBtn = document.getElementById('btnClearCodigosSearch');
        if (clearBtn) {
            if (val && val.trim()) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');
        }
        searchDebounceTimer = setTimeout(() => {
            applySearchAndFilters();
        }, 120);
    };

    window.clearCodigosSearch = function() {
        const inp = document.getElementById('codigosInduccionSearchInput');
        if (inp) {
            inp.value = '';
            window.onCodigosSearchInput('');
        }
    };

    // Aplicar búsqueda y filtros
    function applySearchAndFilters() {
        const term = cleanStr(document.getElementById('codigosInduccionSearchInput')?.value || '');
        const summary = document.getElementById('ciSearchResultsSummary');

        if (activeSubTab === 'errores') {
            renderErroresList(term);
        } else if (activeSubTab === 'modelos') {
            renderModelosList(term);
        } else if (activeSubTab === 'touch') {
            renderTouchControls(term);
        } else if (activeSubTab === 'modulos') {
            renderModulos(term);
        }
    }

    // Renderizar tarjetas de errores
    function renderErroresList(term = '') {
        const grid = document.getElementById('ciErroresListGrid');
        if (!grid) return;

        const all = window.TEKA_INDUCTION_ERRORS || [];
        let filtered = all.filter(e => {
            // Chip filter
            if (currentErrorFilter === 'F' && !e.codigo.startsWith('F')) return false;
            if (currentErrorFilter === 'C' && !e.codigo.startsWith('C')) return false;
            if (currentErrorFilter !== 'all' && currentErrorFilter !== 'F' && currentErrorFilter !== 'C') {
                if (!cleanStr(e.componente).includes(cleanStr(currentErrorFilter))) return false;
            }

            // Text search
            if (!term) return true;
            const matchCode = cleanStr(e.codigo).includes(term) || cleanStr(e.codigoLimpio).includes(term);
            const matchDesc = cleanStr(e.descripcion).includes(term);
            const matchSol = cleanStr(e.solucion).includes(term);
            const matchComp = cleanStr(e.componente).includes(term);
            return matchCode || matchDesc || matchSol || matchComp;
        });

        const summary = document.getElementById('ciSearchResultsSummary');
        if (summary) {
            summary.innerHTML = `Mostrando <strong class="text-blue-400 font-bold">${filtered.length}</strong> de ${all.length} códigos de error`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
                    <div class="text-3xl">🔍</div>
                    <div class="font-bold text-sm text-slate-300">No se encontraron errores coincidentes</div>
                    <div class="text-xs">Prueba escribiendo otro código o término técnico (ej. F05, F47, C81, red, sensor).</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(e => {
            const isCritical = e.severidad === 'error';
            const badgeBg = isCritical 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/30';
            const badgeIcon = isCritical ? '🚨' : '⚠️';
            const cardBorder = isCritical ? 'hover:border-rose-500/40' : 'hover:border-amber-500/40';

            // Comprobar si requiere reconfiguración Touch Control
            const isConfigError = cleanStr(e.descripcion).includes('configuracion') || e.codigo === 'F 47' || e.codigo === 'F 56' || e.codigo === 'F 58';

            return `
                <div class="glass-card p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg ${cardBorder} transition-all flex flex-col justify-between group hover:shadow-2xl">
                    <div class="space-y-2.5">
                        <!-- Top Row: Badge Código + Componente -->
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                                <span class="text-base font-black px-3 py-1 rounded-xl border ${badgeBg} shadow-sm font-mono tracking-tight flex items-center gap-1.5">
                                    <span>${badgeIcon}</span>
                                    <span>${e.codigo}</span>
                                </span>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    ${e.tipo}
                                </span>
                            </div>
                            <span class="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 truncate max-w-[130px]">
                                ${e.componente}
                            </span>
                        </div>

                        <!-- Descripción -->
                        <div>
                            <div class="text-[10px] uppercase font-bold text-slate-400">Descripción del Fallo:</div>
                            <div class="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                                ${highlightTerm(e.descripcion, term)}
                            </div>
                        </div>

                        <!-- Solución -->
                        <div class="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                            <div class="text-[10px] font-extrabold uppercase text-emerald-400 flex items-center gap-1">
                                <span>🛠️ Posible Solución / Acción:</span>
                            </div>
                            <div class="text-slate-200 font-semibold mt-1 leading-snug">
                                ${highlightTerm(e.solucion, term)}
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Buttons -->
                    <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                        <button type="button" onclick="window.openErrorDetailModal('${e.codigo}')" class="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-all cursor-pointer">
                            <span>📋 Diagnóstico</span>
                        </button>
                        
                        <div class="flex items-center gap-1.5">
                            ${isConfigError ? `
                                <button type="button" onclick="switchCodigosSubTab('touch')" class="px-2 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 text-[10px] font-bold transition-all cursor-pointer" title="Ver cómo reconfigurar Touch Control">
                                    🎛️ Guía Touch
                                </button>
                            ` : ''}
                            <button type="button" onclick="window.copyDiagnosis('${e.codigo}')" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-semibold transition-all cursor-pointer active:scale-95" title="Copiar diagnóstico para informe o WhatsApp">
                                📋 Copiar
                            </button>
                            <button type="button" onclick="window.shareWhatsAppDiagnosis('${e.codigo}')" class="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-semibold transition-all cursor-pointer active:scale-95" title="Compartir en WhatsApp">
                                📲 WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar tabla de modelos
    function renderModelosList(term = '') {
        const tbody = document.getElementById('ciModelosTableBody');
        if (!tbody) return;

        const all = window.TEKA_INDUCTION_MODELS || [];
        let filtered = all.filter(m => {
            if (!term) return true;
            const matchProd = cleanStr(m.codProducto).includes(term);
            const matchMod = cleanStr(m.modelo).includes(term);
            const matchGen = cleanStr(m.generacion).includes(term);
            const matchTc = cleanStr(m.touchControl).includes(term);
            const matchConf = cleanStr(m.codConf).includes(term);
            return matchProd || matchMod || matchGen || matchTc || matchConf;
        });

        const summary = document.getElementById('ciSearchResultsSummary');
        if (summary) {
            summary.innerHTML = `Mostrando <strong class="text-blue-400 font-bold">${filtered.length}</strong> de ${all.length} modelos de placa`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-8 text-center text-slate-400">
                        No se encontraron modelos coincidentes con "${term}".
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(m => {
            return `
                <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="p-3 font-mono font-bold text-slate-300">
                        ${highlightTerm(m.codProducto || '---', term)}
                    </td>
                    <td class="p-3 font-bold text-white">
                        <div class="flex items-center gap-1.5">
                            <span>${highlightTerm(m.modelo, term)}</span>
                        </div>
                        ${m.notas ? `<div class="text-[10px] font-normal text-amber-300/90 mt-0.5">${m.notas}</div>` : ''}
                    </td>
                    <td class="p-3 font-semibold text-slate-300">
                        <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                            ${m.generacion}
                        </span>
                    </td>
                    <td class="p-3 text-slate-300 font-semibold">
                        ${m.touchControl}
                    </td>
                    <td class="p-3 text-center">
                        <span class="font-mono font-black text-sm text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-600/40 shadow-sm">
                            ${m.codConf || '---'}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        <button type="button" onclick="window.viewTouchControlGuide('${m.touchControl}', '${m.modelo}', '${m.codConf}')" class="px-2.5 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-[10px] uppercase shadow-xs transition-all cursor-pointer">
                            Ver Configuración
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Renderizar guía de touch controls
    function renderTouchControls(term = '') {
        const grid = document.getElementById('ciTouchControlsGrid');
        if (!grid) return;

        const all = window.TEKA_TOUCH_CONTROLS || [];
        let filtered = all.filter(tc => {
            if (!term) return true;
            return cleanStr(tc.id).includes(term) || cleanStr(tc.nombre).includes(term) || cleanStr(tc.modelosEjemplo).includes(term) || cleanStr(tc.pasos.join(' ')).includes(term);
        });

        const summary = document.getElementById('ciSearchResultsSummary');
        if (summary) {
            summary.innerHTML = `Mostrando <strong class="text-blue-400 font-bold">${filtered.length}</strong> de ${all.length} tipos de Touch Control`;
        }

        grid.innerHTML = filtered.map(tc => {
            return `
                <div class="glass-card p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Procedimiento Oficial</span>
                            <h3 class="text-base font-black text-white">${tc.nombre}</h3>
                        </div>
                        <span class="text-xs px-2.5 py-1 rounded-xl bg-blue-900/60 text-blue-200 border border-blue-600/40 font-bold">
                            ${tc.id}
                        </span>
                    </div>

                    <!-- Especificaciones Clave -->
                    <div class="grid grid-cols-2 gap-2 text-[11px]">
                        <div class="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span class="text-[9px] text-slate-400 uppercase font-bold block">Displays de Control:</span>
                            <span class="font-bold text-white">${tc.display}</span>
                        </div>
                        <div class="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span class="text-[9px] text-slate-400 uppercase font-bold block">Secuencia de Toque:</span>
                            <span class="font-bold text-sky-300">${tc.sensores}</span>
                        </div>
                        <div class="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span class="text-[9px] text-slate-400 uppercase font-bold block">Ventana Acceso:</span>
                            <span class="font-bold text-amber-300">${tc.ventana}</span>
                        </div>
                        <div class="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span class="text-[9px] text-slate-400 uppercase font-bold block">Funciones Extras:</span>
                            <span class="font-bold text-slate-200">
                                ${tc.sonidoOnOff ? '🔊 Sonido' : ''} ${tc.limitadorPotencia ? '⚡ Potencia' : 'Estándar'}
                            </span>
                        </div>
                    </div>

                    <!-- Pasos detallados -->
                    <div class="space-y-1.5 text-xs text-slate-200">
                        <div class="text-[10px] font-extrabold uppercase text-slate-400">Instrucciones de Configuración:</div>
                        <div class="space-y-1 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/80 text-[11.5px] leading-relaxed">
                            ${tc.pasos.map(p => `<div>${p}</div>`).join('')}
                        </div>
                    </div>

                    <!-- Modelos de ejemplo -->
                    <div class="text-[10.5px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <strong class="text-slate-300">Modelos frecuentes:</strong> ${tc.modelosEjemplo}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar arquitectura de módulos
    function renderModulos(term = '') {
        const grid = document.getElementById('ciModulosGrid');
        if (!grid) return;

        const all = window.TEKA_INDUCTION_MODULES || [];
        grid.innerHTML = all.map(m => {
            return `
                <div class="glass-card p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h3 class="text-base font-black text-white">${m.nombre}</h3>
                        <span class="text-xs px-2.5 py-1 rounded-xl bg-indigo-900/60 text-indigo-200 border border-indigo-600/40 font-bold font-mono">
                            ${m.generacion}
                        </span>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed">${m.descripcion}</p>
                    <div class="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                        <strong class="text-blue-400">Aplicación:</strong> ${m.caracteristicas}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Resaltar coincidencias de búsqueda
    function highlightTerm(text, term) {
        if (!term || !text) return text;
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return String(text).replace(regex, '<mark class="bg-amber-400/30 text-amber-200 px-0.5 rounded font-bold">$1</mark>');
    }

    // Abrir Modal de Detalle Completo de Error
    window.openErrorDetailModal = function(codigo) {
        const err = (window.TEKA_INDUCTION_ERRORS || []).find(e => e.codigo === codigo);
        if (!err) return;

        const modal = document.getElementById('ciDetailModal');
        const body = document.getElementById('ciModalBodyContent');
        if (!modal || !body) return;

        const isCritical = err.severidad === 'error';
        const badgeBg = isCritical ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

        body.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <span class="text-xl font-black px-3.5 py-1.5 rounded-2xl border ${badgeBg} font-mono shadow-sm">
                        ${err.codigo}
                    </span>
                    <div>
                        <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">${err.tipo}</div>
                        <h3 class="text-lg font-black text-white leading-tight">${err.descripcion}</h3>
                    </div>
                </div>

                <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span class="text-[10px] font-extrabold uppercase text-slate-400">Componente Involucrado:</span>
                    <div class="font-bold text-sky-300 text-sm">${err.componente}</div>
                </div>

                <div class="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1.5">
                    <span class="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                        <span>🛠️ Solución Oficial Recomendada:</span>
                    </span>
                    <div class="font-bold text-emerald-200 text-sm">${err.solucion}</div>
                </div>

                <!-- Pasos de Diagnóstico de Campo -->
                <div class="space-y-2 text-xs">
                    <div class="text-[10px] font-black uppercase text-slate-400">Protocolo de Verificación para el Técnico:</div>
                    <div class="space-y-1.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                        ${err.pasosDiagnostico.map((p, idx) => `
                            <div class="flex items-start gap-2 text-slate-200">
                                <span class="font-bold text-blue-400 shrink-0 font-mono">${idx + 1}.</span>
                                <span>${p}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button type="button" onclick="window.copyDiagnosis('${err.codigo}')" class="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all shadow-sm">
                        📋 Copiar Diagnóstico
                    </button>
                    <button type="button" onclick="window.shareWhatsAppDiagnosis('${err.codigo}')" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm">
                        📲 Enviar por WhatsApp
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    };

    window.closeCiDetailModal = function() {
        const modal = document.getElementById('ciDetailModal');
        if (modal) modal.classList.add('hidden');
    };

    // Saltar a la guía de touch control desde un modelo
    window.viewTouchControlGuide = function(tcName, modelName, confCode) {
        // Encontrar tipo base
        const match = tcName.match(/Tipo\s+[IVX]+/i);
        const targetId = match ? match[0].replace('\"', '').trim() : tcName;

        switchCodigosSubTab('touch');
        const inp = document.getElementById('codigosInduccionSearchInput');
        if (inp) {
            inp.value = targetId;
            window.onCodigosSearchInput(targetId);
        }

        if (window.showMessage) {
            window.showMessage(`💡 ${modelName}: Código Conf. = ${confCode} en ${targetId}`, 'fix-accent');
        }
    };

    // Copiar diagnóstico al portapapeles
    window.copyDiagnosis = function(codigo) {
        const err = (window.TEKA_INDUCTION_ERRORS || []).find(e => e.codigo === codigo);
        if (!err) return;

        const text = `*DIAGNÓSTICO TÉCNICO TEKA*\n` +
                     `Código: ${err.codigo}\n` +
                     `Fallo: ${err.descripcion}\n` +
                     `Componente: ${err.componente}\n` +
                     `Solución: ${err.solucion}\n` +
                     `Fuente: Manual NTEH15017 ES - FIX Gestión`;

        navigator.clipboard.writeText(text).then(() => {
            if (window.showMessage) window.showMessage(`✅ Diagnóstico de error ${err.codigo} copiado al portapapeles`, 'fix-report');
        }).catch(() => {
            prompt('Copia el diagnóstico:', text);
        });
    };

    // Compartir por WhatsApp
    window.shareWhatsAppDiagnosis = function(codigo) {
        const err = (window.TEKA_INDUCTION_ERRORS || []).find(e => e.codigo === codigo);
        if (!err) return;

        const text = `*DIAGNÓSTICO TÉCNICO TEKA*\n` +
                     `Código: ${err.codigo}\n` +
                     `Fallo: ${err.descripcion}\n` +
                     `Componente: ${err.componente}\n` +
                     `Solución recomendada: ${err.solucion}\n\n` +
                     `_FIX Gestión Técnica Especializada_`;

        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

})();
