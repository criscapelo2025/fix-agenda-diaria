/**
 * ============================================================================
 * MÓDULO OFICIAL DE RECIBO FIX / ORDEN DE SERVICIO TÉCNICO
 * Generador de Recibos para Mantenimientos Preventivos y Reparaciones
 * Dibuja los datos con fidelidad 100% sobre la plantilla "RECIBO FIX.jpeg"
 * Permite ingresar:
 *  - Fecha y Nº de Orden
 *  - Nombre del Cliente
 *  - Equipos Intervenidos
 *  - Descripción del Trabajo Realizado
 *  - Costo Total Único O Desglose de Valores (Repuestos + Mano de Obra)
 *  - IVA opcional del 15% con cálculo automático
 *  - Descarga directa en Imagen (JPG / PNG) y Copia al Portapapeles
 * ============================================================================
 */

(function() {
    'use strict';

    // Estado del Recibo actual
    window.reciboFixState = {
        fecha: new Date().toISOString().split('T')[0],
        ordenNo: generateNextOrderNo(),
        cliente: '',
        telefono: '',
        equipo: '',
        descripcion: '',
        costoModo: 'total', // 'total' | 'detallado'
        costoTotal: 0,
        items: [
            { concepto: 'MANO DE OBRA', valor: 25.00 },
            { concepto: 'REPUESTO / INSUMO', valor: 35.00 }
        ],
        aplicarIva: false,
        ivaPorcentaje: 15,
        subtotal: 0,
        ivaValor: 0,
        totalFinal: 0,
        incluirDetalleEnTrabajo: true,
        // Preferencias de Legibilidad y Accesibilidad Visual
        tamanoFuente: (function() {
            try {
                const s = localStorage.getItem('fix_recibo_font_size');
                return (s === 'normal' || s === 'grande' || s === 'extragrande') ? s : 'grande';
            } catch(e) { return 'grande'; }
        })(), // 'normal' | 'grande' | 'extragrande'
        altoContraste: true,
        // Distribución manual o automática
        lineasManuales: false,
        linea1: '',
        linea2: '',
        linea3: '',
        linea4: ''
    };

    // Array en memoria de recibos guardados
    window.recibosFixList = [];

    // Bandera para evitar re-crear imagen base64
    let templateImageObj = null;
    let isImageLoaded = false;

    // Generar siguiente número de orden
    function generateNextOrderNo() {
        try {
            const last = localStorage.getItem('fix_last_order_num');
            let nextNum = last ? parseInt(last, 10) + 1 : 101;
            if (isNaN(nextNum) || nextNum < 1) nextNum = 101;
            return 'FIX-' + String(nextNum).padStart(4, '0');
        } catch(e) {
            return 'FIX-0101';
        }
    }

    // Guardar último número de orden utilizado
    function incrementOrderNumber(currentOrd) {
        try {
            const matches = String(currentOrd).match(/\d+/);
            if (matches) {
                const num = parseInt(matches[0], 10);
                localStorage.setItem('fix_last_order_num', String(num));
            }
        } catch(e) {}
    }

    // Inicializar Recibos guardados desde LocalStorage
    function loadSavedRecibos() {
        try {
            const saved = localStorage.getItem('fix_recibos_guardados');
            if (saved) {
                window.recibosFixList = JSON.parse(saved);
                if (!Array.isArray(window.recibosFixList)) window.recibosFixList = [];
            }
        } catch(e) {
            console.warn('Error cargando recibos guardados:', e);
            window.recibosFixList = [];
        }
    }

    function persistSavedRecibos() {
        try {
            localStorage.setItem('fix_recibos_guardados', JSON.stringify(window.recibosFixList));
        } catch(e) {}
    }

    // Cargar la imagen de fondo
    function getTemplateImage(callback) {
        if (templateImageObj && isImageLoaded) {
            callback(templateImageObj);
            return;
        }

        const img = new Image();
        img.onload = function() {
            templateImageObj = img;
            isImageLoaded = true;
            callback(img);
        };
        img.onerror = function() {
            console.error('Error cargando plantilla de Recibo FIX');
            // Si falla el base64, intentar directamente la ruta relativa
            if (img.src !== 'RECIBO%20FIX.jpeg' && img.src !== 'RECIBO FIX.jpeg') {
                img.src = 'RECIBO FIX.jpeg';
            }
        };

        if (window.RECIBO_FIX_BASE64) {
            img.src = window.RECIBO_FIX_BASE64;
        } else {
            img.src = 'RECIBO FIX.jpeg';
        }
    }

    // Recalcular montos (Subtotal, IVA 15%, Total)
    window.recalculateReciboTotals = function() {
        const state = window.reciboFixState;
        let sub = 0;

        if (state.costoModo === 'total') {
            sub = parseFloat(state.costoTotal) || 0;
        } else {
            sub = (state.items || []).reduce((acc, it) => acc + (parseFloat(it.valor) || 0), 0);
        }

        state.subtotal = Math.round(sub * 100) / 100;

        if (state.aplicarIva) {
            state.ivaValor = Math.round((state.subtotal * (state.ivaPorcentaje / 100)) * 100) / 100;
            state.totalFinal = Math.round((state.subtotal + state.ivaValor) * 100) / 100;
        } else {
            state.ivaValor = 0;
            state.totalFinal = state.subtotal;
        }

        // Actualizar visualmente la sección de totales en el formulario
        updateTotalsUI();

        // Renderizar el canvas
        window.renderReciboCanvas();
    };

    function updateTotalsUI() {
        const state = window.reciboFixState;
        const subEl = document.getElementById('rfSummarySubtotal');
        const ivaRow = document.getElementById('rfSummaryIvaRow');
        const ivaEl = document.getElementById('rfSummaryIva');
        const totEl = document.getElementById('rfSummaryTotal');
        const itemsTotalBadge = document.getElementById('rfItemsTotalBadge');

        if (subEl) subEl.textContent = '$' + state.subtotal.toFixed(2);
        if (ivaRow) {
            if (state.aplicarIva) {
                ivaRow.classList.remove('hidden');
                if (ivaEl) ivaEl.textContent = '$' + state.ivaValor.toFixed(2);
            } else {
                ivaRow.classList.add('hidden');
            }
        }
        if (totEl) totEl.textContent = '$' + state.totalFinal.toFixed(2);
        if (itemsTotalBadge) itemsTotalBadge.textContent = '$' + state.subtotal.toFixed(2);
    }

    // Formatear fecha para el recibo
    function formatFechaRecibo(dateStr) {
        if (!dateStr) return '';
        // Si viene en YYYY-MM-DD
        const parts = String(dateStr).split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    /**
     * CONFIGURACIÓN DE TAMAÑO DE LETRA Y ACCESIBILIDAD VISUAL
     */
    window.setReciboTamanoFuente = function(tamano) {
        window.reciboFixState.tamanoFuente = tamano;
        try {
            localStorage.setItem('fix_recibo_font_size', tamano);
        } catch(e) {}

        syncFontSizeButtons();
        window.renderReciboCanvas();
    };

    function syncFontSizeButtons() {
        const cur = window.reciboFixState.tamanoFuente || 'grande';
        ['normal', 'grande', 'extragrande'].forEach(t => {
            const btn = document.getElementById('rfBtnTam_' + t);
            if (btn) {
                if (t === cur) {
                    btn.className = 'flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase transition-all bg-cyan-600 text-white shadow-md cursor-pointer border-2 border-cyan-300 ring-2 ring-cyan-400/50';
                } else {
                    btn.className = 'flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-200 cursor-pointer border border-stone-300 dark:border-slate-700';
                }
            }
        });
    }

    /**
     * MODAL DE VISTA PREVIA AMPLIADA (ZOOM PARA PERSONAS CON DIFICULTAD VISUAL)
     */
    let currentModalZoomScale = 1.0;

    window.setReciboZoomLevel = function(scale) {
        currentModalZoomScale = Math.max(0.75, Math.min(2.5, scale));
        const imgEl = document.getElementById('reciboZoomImg');
        const badgeEl = document.getElementById('reciboZoomScaleBadge');
        if (imgEl) {
            imgEl.style.transform = `scale(${currentModalZoomScale})`;
            imgEl.style.transformOrigin = 'center top';
            imgEl.style.transition = 'transform 0.15s ease-out';
        }
        if (badgeEl) {
            badgeEl.textContent = Math.round(currentModalZoomScale * 100) + '%';
        }
    };

    window.adjustReciboZoomLevel = function(delta) {
        window.setReciboZoomLevel(currentModalZoomScale + delta);
    };

    window.toggleReciboPreviewZoom = function(open) {
        let modal = document.getElementById('reciboZoomModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'reciboZoomModal';
            modal.className = 'fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 transition-all hidden';
            modal.innerHTML = `
                <div class="w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
                    <div class="p-3 sm:p-4 bg-slate-950 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">🔍</span>
                            <div>
                                <h4 class="font-black text-sm sm:text-base text-white uppercase tracking-wide leading-tight">Vista Previa Ampliada de Alta Legibilidad</h4>
                                <p class="text-xs text-cyan-300 font-bold m-0">Revisa cada letra y número en tamaño gigante antes de descargar</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <!-- Controles de aumento (Lupa) -->
                            <div class="flex items-center gap-1.5 bg-slate-900 border border-cyan-500/50 rounded-xl px-2.5 py-1 shadow-inner">
                                <span class="text-xs font-black text-cyan-300">LUPA:</span>
                                <button type="button" onclick="adjustReciboZoomLevel(-0.25)" class="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-base font-black cursor-pointer border border-slate-700" title="Reducir">－</button>
                                <span id="reciboZoomScaleBadge" class="text-xs font-mono font-black text-cyan-200 px-2 min-w-[50px] text-center">100%</span>
                                <button type="button" onclick="adjustReciboZoomLevel(0.25)" class="w-8 h-8 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-base font-black cursor-pointer shadow-xs" title="Aumentar">＋</button>
                                <button type="button" onclick="setReciboZoomLevel(1.0)" class="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer ml-1" title="Restablecer tamaño">100%</button>
                            </div>
                            <!-- Botón Descargar -->
                            <button type="button" onclick="descargarReciboImagen('jpeg')" class="bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition-all">
                                <span>📥</span> Descargar JPG
                            </button>
                            <!-- Botón Cerrar -->
                            <button type="button" onclick="toggleReciboPreviewZoom(false)" class="bg-slate-800 hover:bg-slate-700 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm uppercase flex items-center gap-1 cursor-pointer transition-all">
                                ✕ Cerrar
                            </button>
                        </div>
                    </div>
                    <div class="p-2 sm:p-6 overflow-auto flex items-center justify-center flex-1 bg-slate-950/95" onclick="if(event.target===this) toggleReciboPreviewZoom(false)">
                        <img id="reciboZoomImg" class="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border-2 border-cyan-400/30 object-contain select-none" />
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Escuchar tecla ESC para cerrar
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    window.toggleReciboPreviewZoom(false);
                }
            });
        }

        if (open) {
            const canvas = document.getElementById('reciboFixCanvas');
            const imgEl = document.getElementById('reciboZoomImg');
            if (canvas && imgEl) {
                imgEl.src = canvas.toDataURL('image/png');
            }
            window.setReciboZoomLevel(1.0);
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    };

    /**
     * DIBUJAR EN EL CANVAS OFICIAL CON ALTA LEGIBILIDAD
     */
    window.renderReciboCanvas = function() {
        const canvas = document.getElementById('reciboFixCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        getTemplateImage(function(img) {
            // Dimensiones nativas de la plantilla: 770 x 851
            const baseW = 770;
            const baseH = 851;
            const retinaScale = 2; // Factor x2 para nitidez HD en móviles y computadoras

            if (canvas.width !== baseW * retinaScale || canvas.height !== baseH * retinaScale) {
                canvas.width = baseW * retinaScale;
                canvas.height = baseH * retinaScale;
            }

            ctx.save();
            ctx.scale(retinaScale, retinaScale);

            // 1. Dibujar plantilla de fondo
            ctx.clearRect(0, 0, baseW, baseH);
            ctx.drawImage(img, 0, 0, baseW, baseH);

            const state = window.reciboFixState;

            // Factor de escala según preferencia del usuario (default 'grande')
            let scaleMult = 1.25;
            if (state.tamanoFuente === 'normal') scaleMult = 1.05;
            else if (state.tamanoFuente === 'extragrande') scaleMult = 1.45;

            // Configuración común de tipografía extra-bold / black
            const fontSans = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

            // Función auxiliar para texto ultra-nítido con halo oscuro de alto contraste
            function drawCleanText(text, x, y, options = {}) {
                if (!text && text !== 0) return;
                const str = String(text).toUpperCase();
                ctx.save();

                let baseSize = options.baseSize || 16;
                let targetSize = Math.round(baseSize * scaleMult);

                ctx.font = `900 ${targetSize}px ${fontSans}`;
                ctx.fillStyle = options.color || '#ffffff';
                ctx.textAlign = options.align || 'left';
                ctx.textBaseline = options.baseline || 'alphabetic';

                // Reducción proporcional si excede el ancho máximo disponible
                if (options.maxWidth) {
                    while (ctx.measureText(str).width > options.maxWidth && targetSize > 11) {
                        targetSize -= 0.5;
                        ctx.font = `900 ${targetSize}px ${fontSans}`;
                    }
                }

                // HALO OSCURO DE CONTRASTE (Permite leer perfectamente el texto sobre cualquier fondo)
                if (state.altoContraste !== false && options.stroke !== false) {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1;
                    ctx.strokeStyle = options.strokeColor || 'rgba(2, 6, 23, 0.98)';
                    ctx.lineWidth = options.strokeWidth || (targetSize >= 26 ? 7 : (targetSize >= 18 ? 5.5 : 4));
                    ctx.lineJoin = 'round';
                    ctx.miterLimit = 2;
                    ctx.strokeText(str, x, y);
                    ctx.restore();
                }

                // Relleno nítido y brillante
                ctx.fillText(str, x, y);
                ctx.restore();
            }

            // 2. FECHA: (x: ~120, y: ~254)
            const fStr = formatFechaRecibo(state.fecha);
            drawCleanText(fStr, 120, 254, {
                baseSize: 16,
                color: '#ffffff',
                maxWidth: 140
            });

            // 3. ORDEN NO: (x: ~648, y: ~254)
            drawCleanText(state.ordenNo || '0001', 648, 254, {
                baseSize: 17,
                color: '#38bdf8', // Celeste neón brillante de alto contraste
                maxWidth: 90
            });

            // 4. NOMBRE DEL CLIENTE: (x: ~358, y: ~386)
            const clienteStr = (state.cliente || '').trim();
            drawCleanText(clienteStr, 358, 386, {
                baseSize: 18,
                color: '#ffffff',
                maxWidth: 355
            });

            // 5. EQUIPO(S): (x: ~175, y: ~465)
            const equipoStr = (state.equipo || '').trim();
            drawCleanText(equipoStr, 175, 465, {
                baseSize: 17,
                color: '#ffffff',
                maxWidth: 535
            });

            // 6. TRABAJO REALIZADO: (4 Líneas horizontales)
            // Coordenadas Y de las líneas base: L1: 588, L2: 630, L3: 672, L4: 714
            const lineY = [588, 630, 672, 714];
            const maxLineWidth = 640;
            const startX = 60;
            const descFontSize = Math.round(16.5 * scaleMult);

            let finalLines = ['', '', '', ''];

            if (state.lineasManuales) {
                // Modo manual
                finalLines[0] = state.linea1 || '';
                finalLines[1] = state.linea2 || '';
                finalLines[2] = state.linea3 || '';
                finalLines[3] = state.linea4 || '';
            } else {
                // Modo automático inteligente
                const descText = (state.descripcion || '').trim();
                
                // Si hay detalle de items y la opción está activa
                if (state.costoModo === 'detallado' && state.incluirDetalleEnTrabajo && state.items && state.items.length > 0) {
                    const descLines = descText ? wrapTextIntoLines(ctx, descText, `900 ${descFontSize}px ${fontSans}`, maxLineWidth, 2) : [];
                    let curLine = 0;
                    descLines.forEach(l => {
                        if (l && curLine < 4) finalLines[curLine++] = l;
                    });

                    // Items formateados con viñeta clara
                    const itemStrings = state.items.map(it => `• ${it.concepto.toUpperCase()}: $${(parseFloat(it.valor) || 0).toFixed(2)}`);

                    // Llenar las líneas restantes
                    for (let i = 0; i < itemStrings.length && curLine < 4; i++) {
                        if (curLine === 3 && i + 1 < itemStrings.length) {
                            const joined = itemStrings[i] + '   |   ' + itemStrings[i+1];
                            if (ctx.measureText(joined.toUpperCase()).width <= maxLineWidth) {
                                finalLines[curLine++] = joined;
                                i++;
                                continue;
                            }
                        }
                        finalLines[curLine++] = itemStrings[i];
                    }

                    // Si queda espacio libre en la última línea y hay IVA, mostrar desglose claro
                    if (!finalLines[3] && state.aplicarIva) {
                        finalLines[3] = `SUBTOTAL: $${state.subtotal.toFixed(2)}  |  IVA 15%: $${state.ivaValor.toFixed(2)}  |  TOTAL: $${state.totalFinal.toFixed(2)}`;
                    }
                } else {
                    // Solo la descripción general distribuida en las 4 líneas
                    const descLines = wrapTextIntoLines(ctx, descText, `900 ${descFontSize}px ${fontSans}`, maxLineWidth, 4);
                    for (let i = 0; i < 4; i++) {
                        finalLines[i] = descLines[i] || '';
                    }
                }
            }

            // Dibujar las 4 líneas con fuentes ampliadas y contorno oscuro
            for (let i = 0; i < 4; i++) {
                if (finalLines[i]) {
                    drawCleanText(finalLines[i], startX, lineY[i], {
                        baseSize: 16.5,
                        color: '#ffffff',
                        maxWidth: maxLineWidth
                    });
                }
            }

            // 7. PRECIO:
            // En el recuadro inferior:
            // "PRECIO:" está a la izquierda (x: ~55, y: ~804)
            // "$" está a la derecha (x: ~530, y: ~804)
            // El valor va después del signo $: x: ~555, y: ~801
            const totalStr = state.totalFinal.toFixed(2);

            drawCleanText(totalStr, 555, 801, {
                baseSize: 30, // Ultra grande y visible
                color: '#38bdf8', // Neón cyan destacado
                maxWidth: 150
            });

            // Si hay IVA o desglose, mostrar subtotal + IVA en el espacio libre a la izquierda del $ (x: 155 a 510)
            if (state.aplicarIva || (state.costoModo === 'detallado' && state.items.length > 1)) {
                let note = '';
                if (state.aplicarIva) {
                    note = `SUBTOTAL: $${state.subtotal.toFixed(2)}   +   IVA (15%): $${state.ivaValor.toFixed(2)}`;
                } else {
                    note = `VALOR TOTAL DE REPARACIÓN Y REPUESTOS`;
                }

                drawCleanText(note, 155, 801, {
                    baseSize: 14,
                    color: '#fef08a', // Amarillo dorado brillante de alto contraste
                    maxWidth: 360
                });
            }

            ctx.restore();

            // Si el modal de zoom está abierto, actualizar su imagen en vivo
            const zoomModal = document.getElementById('reciboZoomModal');
            if (zoomModal && !zoomModal.classList.contains('hidden')) {
                const imgEl = document.getElementById('reciboZoomImg');
                if (imgEl) imgEl.src = canvas.toDataURL('image/png');
            }
        });
    };

    // Auxiliar para envolver texto en máximo N líneas
    function wrapTextIntoLines(ctx, text, font, maxWidth, maxLines) {
        if (!text) return [];
        ctx.save();
        ctx.font = font;

        // Separar si ya contiene saltos de línea manuales
        const rawLines = text.split('\n');
        const result = [];

        rawLines.forEach(paragraph => {
            const words = paragraph.split(/\s+/).filter(w => w.length > 0);
            let currentLine = '';

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine ? (currentLine + ' ' + word) : word;
                const metrics = ctx.measureText(testLine.toUpperCase());
                
                if (metrics.width > maxWidth && currentLine) {
                    result.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) {
                result.push(currentLine);
            }
        });

        ctx.restore();
        return result.slice(0, maxLines);
    }

    /**
     * GESTIÓN DE ITEMS EN MODO DETALLADO
     */
    window.renderReciboItemsList = function() {
        const container = document.getElementById('rfItemsListContainer');
        if (!container) return;

        const state = window.reciboFixState;
        if (!state.items || state.items.length === 0) {
            container.innerHTML = `
                <div class="p-4 rounded-xl border border-dashed border-stone-300 dark:border-slate-700 text-center text-stone-400 text-xs font-semibold">
                    No hay rubros agregados. Haz clic en <strong>+ Agregar Rubro</strong> para detallar repuestos o mano de obra.
                </div>
            `;
            return;
        }

        let html = '';
        state.items.forEach((it, idx) => {
            html += `
                <div class="flex items-center gap-2.5 p-3 bg-stone-50 dark:bg-slate-800/80 rounded-2xl border-2 border-stone-300 dark:border-slate-700 transition-all hover:border-cyan-400 shadow-xs">
                    <span class="text-xs sm:text-sm font-mono font-black text-cyan-600 dark:text-cyan-400 w-6 text-center shrink-0">#${idx + 1}</span>
                    <input type="text" value="${escapeHtml(it.concepto)}" 
                           oninput="window.updateReciboItem(${idx}, 'concepto', this.value)" 
                           placeholder="RUBRO (EJ: TERMOSTATO, MANO DE OBRA)" 
                           class="flex-1 p-3 bg-white dark:bg-slate-900 border-2 border-stone-300 dark:border-slate-700 rounded-xl text-sm sm:text-base font-black uppercase text-stone-900 dark:text-white outline-none focus:border-cyan-500 shadow-inner">
                    <div class="relative w-32 sm:w-36 shrink-0">
                        <span class="absolute left-3 top-3 text-sm sm:text-base font-black text-stone-400">$</span>
                        <input type="number" step="0.01" min="0" value="${it.valor !== undefined ? it.valor : ''}" 
                               oninput="window.updateReciboItem(${idx}, 'valor', this.value)" 
                               placeholder="0.00" 
                               class="w-full p-3 pl-8 bg-white dark:bg-slate-900 border-2 border-stone-300 dark:border-slate-700 rounded-xl text-sm sm:text-base font-mono font-black text-right text-stone-900 dark:text-cyan-400 outline-none focus:border-cyan-500 shadow-inner">
                    </div>
                    <button type="button" onclick="window.removeReciboItem(${idx})" class="p-3 text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-400" title="Eliminar fila">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    };

    window.addReciboItem = function(concepto = '', valor = 0) {
        window.reciboFixState.items.push({
            concepto: concepto || '',
            valor: parseFloat(valor) || 0
        });
        window.renderReciboItemsList();
        window.recalculateReciboTotals();
    };

    window.removeReciboItem = function(index) {
        if (window.reciboFixState.items[index] !== undefined) {
            window.reciboFixState.items.splice(index, 1);
            window.renderReciboItemsList();
            window.recalculateReciboTotals();
        }
    };

    window.updateReciboItem = function(index, field, val) {
        const item = window.reciboFixState.items[index];
        if (!item) return;

        if (field === 'concepto') {
            item.concepto = String(val).toUpperCase();
        } else if (field === 'valor') {
            item.valor = parseFloat(val) || 0;
        }

        window.recalculateReciboTotals();
    };

    // Cambiar modo de costo: 'total' | 'detallado'
    window.setReciboCostoModo = function(modo) {
        window.reciboFixState.costoModo = modo;

        const btnTotal = document.getElementById('rfBtnModoTotal');
        const btnDetallado = document.getElementById('rfBtnModoDetallado');
        const secTotal = document.getElementById('rfSecCostoTotal');
        const secDetallado = document.getElementById('rfSecCostoDetallado');

        if (modo === 'total') {
            if (btnTotal) {
                btnTotal.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all bg-cyan-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-2';
            }
            if (btnDetallado) {
                btnDetallado.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 cursor-pointer flex items-center justify-center gap-2';
            }
            if (secTotal) secTotal.classList.remove('hidden');
            if (secDetallado) secDetallado.classList.add('hidden');
        } else {
            if (btnTotal) {
                btnTotal.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 cursor-pointer flex items-center justify-center gap-2';
            }
            if (btnDetallado) {
                btnDetallado.className = 'flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all bg-cyan-600 text-white shadow-md cursor-pointer flex items-center justify-center gap-2';
            }
            if (secTotal) secTotal.classList.add('hidden');
            if (secDetallado) secDetallado.classList.remove('hidden');
            window.renderReciboItemsList();
        }

        window.recalculateReciboTotals();
    };

    // Chips rápidos para agregar equipos
    window.toggleReciboEquipoChip = function(equipoNombre) {
        const input = document.getElementById('rfEquipoInput');
        if (!input) return;

        let current = (input.value || '').trim();
        const upper = equipoNombre.toUpperCase();

        if (!current) {
            input.value = upper;
        } else {
            // Verificar si ya está en la lista
            const parts = current.split(',').map(p => p.trim().toUpperCase());
            if (parts.includes(upper)) {
                // Quitar
                const filtered = parts.filter(p => p !== upper);
                input.value = filtered.join(', ');
            } else {
                // Agregar
                input.value = current + ', ' + upper;
            }
        }

        window.reciboFixState.equipo = input.value;
        window.renderReciboCanvas();
    };

    // Plantillas rápidas de trabajo realizado
    window.applyReciboTrabajoTemplate = function(tipo) {
        const textarea = document.getElementById('rfDescripcionInput');
        if (!textarea) return;

        let text = '';
        if (tipo === 'preventivo') {
            text = 'MANTENIMIENTO PREVENTIVO GENERAL, LIMPIEZA TÉCNICA Y CALIBRACIÓN DE SISTEMA';
        } else if (tipo === 'reparacion') {
            text = 'REVISIÓN TÉCNICA, DESMONTAJE, CAMBIO DE COMPONENTES DEFECTUOSOS Y PRUEBAS 100% OK';
        } else if (tipo === 'induccion') {
            text = 'DIAGNÓSTICO ELECTRÓNICO, AJUSTE DE CONEXIONES DE POTENCIA Y CALIBRACIÓN DE INDUCCIÓN';
        } else if (tipo === 'horno') {
            text = 'CAMBIO DE TERMOSTATO / RESISTENCIA, AJUSTE DE BISAGRAS Y VERIFICACIÓN TÉRMICA';
        }

        textarea.value = text;
        window.reciboFixState.descripcion = text;
        window.renderReciboCanvas();
    };

    /**
     * IMPORTAR DATOS DESDE FORMULARIO DE MANTENIMIENTO O CLIENTES
     */
    window.importarDatosDeMantenimiento = function() {
        try {
            const form = document.getElementById('maintForm');
            if (!form) return;

            const nombreInput = form.querySelector('[name="mNombre"]');
            const descInput = form.querySelector('[name="mDescripcion"]');
            const fechaInput = document.getElementById('maintScheduleDate');

            // Leer equipos seleccionados en el dropdown de mantenimiento
            let equiposList = [];
            const checkboxes = document.querySelectorAll('.maint-eq-checkbox:checked');
            checkboxes.forEach(cb => {
                if (cb.value) equiposList.push(cb.value.toUpperCase());
            });

            let filled = 0;

            if (nombreInput && nombreInput.value.trim()) {
                window.reciboFixState.cliente = nombreInput.value.trim().toUpperCase();
                const rfCli = document.getElementById('rfClienteInput');
                if (rfCli) rfCli.value = window.reciboFixState.cliente;
                filled++;
            }

            if (equiposList.length > 0) {
                window.reciboFixState.equipo = equiposList.join(', ');
                const rfEq = document.getElementById('rfEquipoInput');
                if (rfEq) rfEq.value = window.reciboFixState.equipo;
                filled++;
            }

            if (descInput && descInput.value.trim()) {
                window.reciboFixState.descripcion = descInput.value.trim().toUpperCase();
                const rfDesc = document.getElementById('rfDescripcionInput');
                if (rfDesc) rfDesc.value = window.reciboFixState.descripcion;
                filled++;
            }

            if (fechaInput && fechaInput.value) {
                window.reciboFixState.fecha = fechaInput.value;
                const rfFecha = document.getElementById('rfFechaInput');
                if (rfFecha) rfFecha.value = window.reciboFixState.fecha;
            }

            if (filled > 0) {
                if (typeof showMessage === 'function') {
                    showMessage(`✅ Datos importados desde el formulario de mantenimiento (${filled} campos)`, 'fix-report');
                }
                window.renderReciboCanvas();
            } else {
                if (typeof showMessage === 'function') {
                    showMessage('ℹ️ No hay datos escritos en el formulario de mantenimiento para importar', 'fix-pending');
                }
            }
        } catch(e) {
            console.warn('Error importando datos de mantenimiento:', e);
        }
    };

    /**
     * DESCARGAR IMAGEN DEL RECIBO (JPG / PNG)
     */
    window.descargarReciboImagen = function(formato = 'jpeg') {
        const canvas = document.getElementById('reciboFixCanvas');
        if (!canvas) return;

        // Asegurar que esté renderizado
        window.renderReciboCanvas();

        setTimeout(() => {
            try {
                const state = window.reciboFixState;
                const isPng = formato.toLowerCase() === 'png';
                const mime = isPng ? 'image/png' : 'image/jpeg';
                const ext = isPng ? 'png' : 'jpg';
                const quality = isPng ? undefined : 0.95;

                const dataUrl = canvas.toDataURL(mime, quality);

                // Nombre descriptivo y limpio para el archivo
                const safeOrden = (state.ordenNo || 'RECIBO').replace(/[^a-zA-Z0-9_-]/g, '_');
                const safeCliente = (state.cliente || 'CLIENTE').trim().replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
                const safeFecha = (state.fecha || '').replace(/-/g, '');
                const fileName = `RECIBO_FIX_${safeOrden}_${safeCliente || 'Mantenimiento'}_${safeFecha}.${ext}`;

                const link = document.createElement('a');
                link.download = fileName;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Guardar en el historial automáticamente al descargar
                guardarReciboEnHistorialSilencioso();

                // Incrementar número de orden para el próximo recibo
                incrementOrderNumber(state.ordenNo);

                if (typeof showMessage === 'function') {
                    showMessage(`✅ Recibo descargado exitosamente como imagen (.${ext})`, 'fix-report');
                }
            } catch(e) {
                console.error('Error al descargar recibo:', e);
                if (typeof showMessage === 'function') {
                    showMessage('⚠️ No se pudo generar la descarga de la imagen: ' + e.message, 'fix-error');
                }
            }
        }, 80);
    };

    /**
     * COPIAR IMAGEN AL PORTAPAPELES (Para pegar directo con Ctrl+V en WhatsApp)
     */
    window.copiarReciboPortapapeles = async function() {
        const canvas = document.getElementById('reciboFixCanvas');
        if (!canvas) return;

        window.renderReciboCanvas();

        try {
            if (!navigator.clipboard || !window.ClipboardItem) {
                // Fallback directo a descargar imagen si no hay soporte de ClipboardItem
                window.descargarReciboImagen('jpeg');
                return;
            }

            canvas.toBlob(async function(blob) {
                if (!blob) {
                    window.descargarReciboImagen('jpeg');
                    return;
                }
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    guardarReciboEnHistorialSilencioso();
                    if (typeof showMessage === 'function') {
                        showMessage('📋 ¡Recibo copiado al portapapeles! Pégalo directamente con Ctrl+V en WhatsApp o redes', 'fix-report');
                    }
                } catch(err) {
                    console.warn('Fallo ClipboardItem, descargando archivo:', err);
                    window.descargarReciboImagen('jpeg');
                }
            }, 'image/png');
        } catch(err) {
            console.error('Error copiando al portapapeles:', err);
            window.descargarReciboImagen('jpeg');
        }
    };

    /**
     * IMPRIMIR RECIBO
     */
    window.imprimirReciboFix = function() {
        const canvas = document.getElementById('reciboFixCanvas');
        if (!canvas) return;

        try {
            const dataUrl = canvas.toDataURL('image/png');
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Por favor permita ventanas emergentes para imprimir el recibo.');
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Imprimir Recibo FIX - ${window.reciboFixState.ordenNo}</title>
                    <style>
                        body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; font-family: sans-serif; }
                        img { max-width: 100%; height: auto; max-height: 95vh; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; }
                        @media print {
                            body { padding: 0; }
                            img { width: 100%; max-height: none; box-shadow: none; border-radius: 0; }
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" onload="window.print(); window.close();" />
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch(e) {
            console.error('Error al imprimir recibo:', e);
        }
    };

    /**
     * HISTORIAL Y PERSISTENCIA DE RECIBOS
     */
    function guardarReciboEnHistorialSilencioso() {
        const state = window.reciboFixState;
        if (!state.cliente && !state.equipo) return; // No guardar vacíos

        const nuevoRegistro = {
            id: 'REC_' + Date.now(),
            fecha: state.fecha,
            ordenNo: state.ordenNo,
            cliente: state.cliente,
            telefono: state.telefono,
            equipo: state.equipo,
            descripcion: state.descripcion,
            costoModo: state.costoModo,
            costoTotal: state.costoTotal,
            items: JSON.parse(JSON.stringify(state.items || [])),
            aplicarIva: state.aplicarIva,
            ivaPorcentaje: state.ivaPorcentaje,
            subtotal: state.subtotal,
            ivaValor: state.ivaValor,
            totalFinal: state.totalFinal,
            createdAt: new Date().toISOString()
        };

        // Evitar duplicados por ordenNo
        const idx = window.recibosFixList.findIndex(r => r.ordenNo === state.ordenNo);
        if (idx >= 0) {
            window.recibosFixList[idx] = nuevoRegistro;
        } else {
            window.recibosFixList.unshift(nuevoRegistro);
        }

        // Mantener máximo 50
        if (window.recibosFixList.length > 50) {
            window.recibosFixList = window.recibosFixList.slice(0, 50);
        }

        persistSavedRecibos();
        renderHistorialRecibosUI();
    }

    window.guardarReciboManual = function() {
        guardarReciboEnHistorialSilencioso();
        if (typeof showMessage === 'function') {
            showMessage('💾 Recibo guardado en el historial local', 'fix-report');
        }
    };

    window.cargarReciboDesdeHistorial = function(id) {
        const rec = window.recibosFixList.find(r => r.id === id);
        if (!rec) return;

        window.reciboFixState = {
            fecha: rec.fecha || new Date().toISOString().split('T')[0],
            ordenNo: rec.ordenNo || generateNextOrderNo(),
            cliente: rec.cliente || '',
            telefono: rec.telefono || '',
            equipo: rec.equipo || '',
            descripcion: rec.descripcion || '',
            costoModo: rec.costoModo || 'total',
            costoTotal: rec.costoTotal || 0,
            items: JSON.parse(JSON.stringify(rec.items || [])),
            aplicarIva: !!rec.aplicarIva,
            ivaPorcentaje: rec.ivaPorcentaje || 15,
            subtotal: rec.subtotal || 0,
            ivaValor: rec.ivaValor || 0,
            totalFinal: rec.totalFinal || 0,
            incluirDetalleEnTrabajo: true,
            lineasManuales: false,
            linea1: '',
            linea2: '',
            linea3: '',
            linea4: ''
        };

        syncFormInputsFromState();
        window.recalculateReciboTotals();

        if (typeof showMessage === 'function') {
            showMessage(`📋 Recibo ${rec.ordenNo} cargado en el editor`, 'fix-report');
        }
    };

    window.eliminarReciboHistorial = function(id) {
        if (!confirm('¿Desea eliminar este recibo del historial?')) return;
        window.recibosFixList = window.recibosFixList.filter(r => r.id !== id);
        persistSavedRecibos();
        renderHistorialRecibosUI();
        if (typeof showMessage === 'function') {
            showMessage('🗑️ Recibo eliminado del historial', 'fix-pending');
        }
    };

    window.nuevoReciboFix = function() {
        window.reciboFixState = {
            fecha: new Date().toISOString().split('T')[0],
            ordenNo: generateNextOrderNo(),
            cliente: '',
            telefono: '',
            equipo: '',
            descripcion: '',
            costoModo: 'total',
            costoTotal: 0,
            items: [
                { concepto: 'MANO DE OBRA', valor: 25.00 },
                { concepto: 'REPUESTO / INSUMO', valor: 35.00 }
            ],
            aplicarIva: false,
            ivaPorcentaje: 15,
            subtotal: 0,
            ivaValor: 0,
            totalFinal: 0,
            incluirDetalleEnTrabajo: true,
            lineasManuales: false,
            linea1: '',
            linea2: '',
            linea3: '',
            linea4: ''
        };

        syncFormInputsFromState();
        window.recalculateReciboTotals();

        if (typeof showMessage === 'function') {
            showMessage('✨ Nuevo recibo en blanco listo para llenar', 'fix-report');
        }
    };

    function syncFormInputsFromState() {
        const state = window.reciboFixState;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

        setVal('rfFechaInput', state.fecha);
        setVal('rfOrdenNoInput', state.ordenNo);
        setVal('rfClienteInput', state.cliente);
        setVal('rfEquipoInput', state.equipo);
        setVal('rfDescripcionInput', state.descripcion);
        setVal('rfCostoTotalInput', state.costoTotal || '');
        setCheck('rfIvaCheckbox', state.aplicarIva);

        window.setReciboCostoModo(state.costoModo);
        window.renderReciboItemsList();
    }

    function renderHistorialRecibosUI() {
        const container = document.getElementById('rfHistorialListContainer');
        if (!container) return;

        if (!window.recibosFixList || window.recibosFixList.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-stone-400 dark:text-slate-500 text-xs font-semibold">
                    No hay recibos generados previamente. Al descargar tu primer recibo se guardará automáticamente aquí.
                </div>
            `;
            return;
        }

        let html = '';
        window.recibosFixList.forEach(rec => {
            html += `
                <div class="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-stone-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all shadow-sm gap-3">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-xs sm:text-sm font-mono font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-300 dark:border-cyan-800">${rec.ordenNo}</span>
                            <span class="text-sm sm:text-base font-black text-stone-900 dark:text-white truncate">${escapeHtml(rec.cliente || 'Sin cliente')}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-slate-300 font-semibold">
                            <span>📅 ${formatFechaRecibo(rec.fecha)}</span>
                            <span>•</span>
                            <span class="truncate max-w-[220px]">🛠️ ${escapeHtml(rec.equipo || 'General')}</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-base sm:text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">$${(rec.totalFinal || 0).toFixed(2)}</div>
                        <div class="text-[11px] uppercase font-black text-stone-500 dark:text-slate-400">${rec.aplicarIva ? '+ 15% IVA' : 'Sin IVA'}</div>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="window.cargarReciboDesdeHistorial('${rec.id}')" class="p-2.5 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-cyan-200 dark:border-cyan-900 cursor-pointer" title="Cargar en editor">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button type="button" onclick="window.eliminarReciboHistorial('${rec.id}')" class="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-rose-200 dark:border-rose-950 cursor-pointer" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * NAVEGACIÓN Y SUBPESTAÑAS DE MANTENIMIENTO
     */
    window.mantenimientoActiveInnerTab = 'agenda';

    window.switchMantenimientoInnerTab = function(tabName) {
        window.mantenimientoActiveInnerTab = tabName;

        const secAgenda = document.getElementById('mantenimiento_sec_agenda');
        const secRecibo = document.getElementById('mantenimiento_sec_recibo');
        const btnAgenda = document.getElementById('mMaintTabBtn_agenda');
        const btnRecibo = document.getElementById('mMaintTabBtn_recibo');

        if (tabName === 'recibo') {
            if (secAgenda) secAgenda.classList.add('hidden');
            if (secRecibo) secRecibo.classList.remove('hidden');

            if (btnAgenda) {
                btnAgenda.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 cursor-pointer shadow-xs';
            }
            if (btnRecibo) {
                btnRecibo.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all bg-cyan-600 text-white shadow-md active cursor-pointer';
            }

            // Inicializar y renderizar canvas
            window.initReciboFixModule();
        } else {
            if (secRecibo) secRecibo.classList.add('hidden');
            if (secAgenda) secAgenda.classList.remove('hidden');

            if (btnAgenda) {
                btnAgenda.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all bg-teal-700 text-white shadow-md active cursor-pointer';
            }
            if (btnRecibo) {
                btnRecibo.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200 cursor-pointer shadow-xs';
            }
        }
    };

    /**
     * INICIALIZAR EL MÓDULO DE RECIBO FIX
     */
    window.initReciboFixModule = function() {
        loadSavedRecibos();
        renderHistorialRecibosUI();
        syncFormInputsFromState();
        syncFontSizeButtons();
        window.recalculateReciboTotals();
    };

    // Auto-arranque al cargar el DOM
    document.addEventListener('DOMContentLoaded', function() {
        loadSavedRecibos();
    });

})();
