/**
 * ============================================================================
 * MÓDULO DE NOTAS Y TAREAS RÁPIDAS (BORRADOR OPERATIVO)
 * Registro ultrarrápido de pendientes, tareas, encargos y seguimiento ágil
 * ============================================================================
 */

window.notasList = [];
window.currentNotasFilter = 'pendientes'; // 'pendientes', 'hoy', 'futuras', 'ejecutadas', 'todas'
window.notasSearchQuery = '';

// Helper para fecha de hoy en formato YYYY-MM-DD local
function getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper para formatear fecha amigable (Hoy, Mañana, Ayer o DD/MM)
function formatFriendlyDate(dateStr) {
    if (!dateStr) return { label: 'Sin Fecha', color: 'bg-slate-100 text-slate-600 border-slate-200', isOverdue: false, isToday: false };
    
    const today = getTodayDateString();
    if (dateStr === today) {
        return { label: '🟢 Hoy', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold', isOverdue: false, isToday: true };
    }
    
    // Calcular diferencia en días
    const dDate = new Date(dateStr + 'T00:00:00');
    const dToday = new Date(today + 'T00:00:00');
    const diffTime = dDate - dToday;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return { label: '🔵 Mañana', color: 'bg-blue-100 text-blue-900 border-blue-300', isOverdue: false, isToday: false };
    } else if (diffDays === -1) {
        return { label: '🔴 Ayer (Atrasada)', color: 'bg-rose-100 text-rose-900 border-rose-300 font-black', isOverdue: true, isToday: false };
    } else if (diffDays < -1) {
        return { label: `🔴 Atrasada (${Math.abs(diffDays)}d)`, color: 'bg-rose-100 text-rose-900 border-rose-300 font-black', isOverdue: true, isToday: false };
    } else {
        const parts = dateStr.split('-');
        const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;
        return { label: `📅 ${formatted}`, color: 'bg-indigo-50 text-indigo-900 border-indigo-200', isOverdue: false, isToday: false };
    }
}

// Inicialización del módulo
window.initNotasRapidas = function() {
    // 1. Cargar desde localStorage como respaldo inmediato
    try {
        const local = localStorage.getItem('fix_notas_rapidas');
        if (local) {
            window.notasList = JSON.parse(local);
        }
    } catch(e) {
        console.warn("Error leyendo notas desde localStorage:", e);
    }

    // 2. Conectar en tiempo real con Firebase
    if (typeof database !== 'undefined' && database.ref) {
        database.ref('notas_rapidas').on('value', function(snapshot) {
            const data = snapshot.val();
            if (data) {
                const list = [];
                Object.keys(data).forEach(key => {
                    const item = data[key];
                    item.id = key;
                    list.push(item);
                });
                window.notasList = list;
            } else {
                window.notasList = [];
            }
            try {
                localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
            } catch(e){}
            
            window.renderNotasRapidasView();
        });
    }

    // 3. Prellenar la fecha de hoy en el input de entrada rápida
    const dateInput = document.getElementById('quickTaskDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = getTodayDateString();
    }

    // 4. Renderizar vista inicial
    window.renderNotasRapidasView();
};

// Agregar tarea rápida
window.addQuickTask = async function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const input = document.getElementById('quickTaskInput');
    const text = (input ? input.value : '').trim();
    if (!text) {
        if (window.showMessage) window.showMessage('⚠️ Escribe el texto de la tarea o nota', 'fix-accent');
        if (input) input.focus();
        return;
    }

    const dateInput = document.getElementById('quickTaskDate');
    const date = dateInput ? dateInput.value : getTodayDateString();

    const prioInput = document.getElementById('quickTaskPriority');
    const priority = prioInput ? prioInput.value : 'NORMAL';

    const newId = 'nota_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newTask = {
        id: newId,
        text: text,
        date: date,
        priority: priority,
        status: 'PENDIENTE',
        createdAt: Date.now(),
        completedAt: null
    };

    // Actualizar estado en memoria inmediatamente para respuesta instantánea (0ms)
    window.notasList.unshift(newTask);
    try {
        localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
    } catch(err){}
    window.renderNotasRapidasView();

    // Limpiar input y mantener foco para seguir agregando más tareas rápidamente
    if (input) {
        input.value = '';
        input.focus();
    }

    if (window.showMessage) {
        window.showMessage('✅ Tarea anotada', 'fix-report');
    }

    // Guardar en Firebase
    if (typeof database !== 'undefined' && database.ref) {
        try {
            await database.ref('notas_rapidas/' + newId).set(newTask);
        } catch(fbErr) {
            console.error("Error guardando nota en Firebase:", fbErr);
        }
    }
};

// Atajo rápido para fijar fecha en el input de creación (Hoy, Mañana, Sin Fecha)
window.setQuickInputDateShortcut = function(shortcut) {
    const dateInput = document.getElementById('quickTaskDate');
    if (!dateInput) return;

    if (shortcut === 'hoy') {
        dateInput.value = getTodayDateString();
    } else if (shortcut === 'manana') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        dateInput.value = `${y}-${m}-${dia}`;
    } else if (shortcut === 'sin_fecha') {
        dateInput.value = '';
    }
};

// Alternar estado: Pendiente <-> Ejecutada (Tachada)
window.toggleTaskStatus = async function(id) {
    const task = (window.notasList || []).find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'EJECUTADA' ? 'PENDIENTE' : 'EJECUTADA';
    task.status = newStatus;
    task.completedAt = (newStatus === 'EJECUTADA') ? Date.now() : null;

    try {
        localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
    } catch(e){}
    window.renderNotasRapidasView();

    if (newStatus === 'EJECUTADA' && window.showMessage) {
        window.showMessage('✔️ Tarea tachada como ejecutada', 'fix-report');
    }

    if (typeof database !== 'undefined' && database.ref) {
        try {
            await database.ref('notas_rapidas/' + id).update({
                status: newStatus,
                completedAt: task.completedAt
            });
        } catch(err) {
            console.error("Error actualizando estado en Firebase:", err);
        }
    }
};

// Cambiar fecha de una tarea existente con 1 clic
window.changeTaskDate = async function(id, newDate) {
    const task = (window.notasList || []).find(t => t.id === id);
    if (!task) return;

    task.date = newDate;
    try {
        localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
    } catch(e){}
    window.renderNotasRapidasView();

    if (typeof database !== 'undefined' && database.ref) {
        try {
            await database.ref('notas_rapidas/' + id).update({ date: newDate });
        } catch(err) {
            console.error("Error actualizando fecha en Firebase:", err);
        }
    }
};

// Editar texto de una tarea
window.editTaskText = async function(id) {
    const task = (window.notasList || []).find(t => t.id === id);
    if (!task) return;

    const nuevoTexto = prompt("Editar tarea / nota:", task.text);
    if (nuevoTexto === null) return;
    const trimmed = nuevoTexto.trim();
    if (!trimmed) {
        if (confirm("¿Deseas eliminar esta tarea?")) {
            window.deleteQuickTask(id);
        }
        return;
    }

    task.text = trimmed;
    try {
        localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
    } catch(e){}
    window.renderNotasRapidasView();

    if (typeof database !== 'undefined' && database.ref) {
        try {
            await database.ref('notas_rapidas/' + id).update({ text: trimmed });
        } catch(err) {
            console.error("Error editando tarea en Firebase:", err);
        }
    }
};

// Eliminar tarea
window.deleteQuickTask = async function(id) {
    window.notasList = (window.notasList || []).filter(t => t.id !== id);
    try {
        localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
    } catch(e){}
    window.renderNotasRapidasView();

    if (window.showMessage) window.showMessage('🗑️ Tarea eliminada', 'fix-accent');

    if (typeof database !== 'undefined' && database.ref) {
        try {
            await database.ref('notas_rapidas/' + id).remove();
        } catch(err) {
            console.error("Error eliminando tarea en Firebase:", err);
        }
    }
};

// Limpiar todas las tareas tachadas / completadas
window.clearCompletedTasks = async function() {
    const completed = (window.notasList || []).filter(t => t.status === 'EJECUTADA');
    if (completed.length === 0) {
        if (window.showMessage) window.showMessage('ℹ️ No hay tareas tachadas para limpiar', 'fix-accent');
        return;
    }

    if (!confirm(`¿Eliminar las ${completed.length} tareas ya ejecutadas y tachadas?`)) {
        return;
    }

    window.notasList = (window.notasList || []).filter(t => t.status !== 'EJECUTADA');
    try {
        localStorage.setItem('fix_notas_rapidas', JSON.stringify(window.notasList));
    } catch(e){}
    window.renderNotasRapidasView();

    if (window.showMessage) window.showMessage(`🧹 Se eliminaron ${completed.length} tareas completadas`, 'fix-report');

    if (typeof database !== 'undefined' && database.ref) {
        const updates = {};
        completed.forEach(t => {
            updates[t.id] = null;
        });
        try {
            await database.ref('notas_rapidas').update(updates);
        } catch(err) {
            console.error("Error eliminando completadas en Firebase:", err);
        }
    }
};

// Cambiar filtro activo
window.setNotasFilter = function(filter) {
    window.currentNotasFilter = filter;
    window.renderNotasRapidasView();
};

// Renderizado principal del listado y contadores
window.renderNotasRapidasView = function() {
    const container = document.getElementById('notasListContainer');
    if (!container) return;

    const list = window.notasList || [];
    const today = getTodayDateString();

    // 1. Calcular KPIs
    const totalCount = list.length;
    const pendientesCount = list.filter(t => t.status !== 'EJECUTADA').length;
    const ejecutadasCount = list.filter(t => t.status === 'EJECUTADA').length;
    const hoyCount = list.filter(t => t.status !== 'EJECUTADA' && t.date === today).length;
    const futurasCount = list.filter(t => t.status !== 'EJECUTADA' && t.date && t.date > today).length;

    // Actualizar elementos en pantalla
    const elKpiTotal = document.getElementById('kpiNotasTotal');
    const elKpiPend = document.getElementById('kpiNotasPendientes');
    const elKpiHoy = document.getElementById('kpiNotasHoy');
    const elKpiFuturas = document.getElementById('kpiNotasFuturas');
    const elKpiEjec = document.getElementById('kpiNotasEjecutadas');

    if (elKpiTotal) elKpiTotal.textContent = totalCount;
    if (elKpiPend) elKpiPend.textContent = pendientesCount;
    if (elKpiHoy) elKpiHoy.textContent = hoyCount;
    if (elKpiFuturas) elKpiFuturas.textContent = futurasCount;
    if (elKpiEjec) elKpiEjec.textContent = ejecutadasCount;

    // Actualizar badges en botones de filtro
    const badgePend = document.getElementById('filterBadge_pendientes');
    const badgeHoy = document.getElementById('filterBadge_hoy');
    const badgeFut = document.getElementById('filterBadge_futuras');
    const badgeEjec = document.getElementById('filterBadge_ejecutadas');
    const badgeAll = document.getElementById('filterBadge_todas');

    if (badgePend) badgePend.textContent = pendientesCount;
    if (badgeHoy) badgeHoy.textContent = hoyCount;
    if (badgeFut) badgeFut.textContent = futurasCount;
    if (badgeEjec) badgeEjec.textContent = ejecutadasCount;
    if (badgeAll) badgeAll.textContent = totalCount;

    // Actualizar estilo activo de botones de filtro
    ['pendientes', 'hoy', 'futuras', 'ejecutadas', 'todas'].forEach(f => {
        const btn = document.getElementById('notasFilterBtn_' + f);
        if (btn) {
            if (f === window.currentNotasFilter) {
                btn.className = 'px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm bg-indigo-600 text-white flex items-center gap-1.5 cursor-pointer';
            } else {
                btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 cursor-pointer';
            }
        }
    });

    // 2. Filtrado de la lista
    const query = (document.getElementById('notasSearchInput')?.value || '').trim().toUpperCase();
    let filtered = list.filter(t => {
        // Filtro de texto
        if (query && !t.text.toUpperCase().includes(query)) {
            return false;
        }

        // Filtro de pestañas
        if (window.currentNotasFilter === 'pendientes') {
            return t.status !== 'EJECUTADA';
        } else if (window.currentNotasFilter === 'hoy') {
            return t.status !== 'EJECUTADA' && t.date === today;
        } else if (window.currentNotasFilter === 'futuras') {
            return t.status !== 'EJECUTADA' && t.date && t.date > today;
        } else if (window.currentNotasFilter === 'ejecutadas') {
            return t.status === 'EJECUTADA';
        }
        return true; // 'todas'
    });

    // 3. Ordenamiento inteligente:
    // Pendientes primero (Hoy -> Atrasadas -> Futuras -> Sin fecha) y al final las Ejecutadas
    filtered.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'EJECUTADA' ? 1 : -1;
        }
        // Si ambas son pendientes, ordenar por fecha
        if (a.date && b.date) {
            return a.date.localeCompare(b.date);
        }
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // 4. Renderizado
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center text-slate-400 font-bold bg-white/60 rounded-2xl border-2 border-dashed border-slate-200">
                <span class="text-4xl block mb-2">📌</span>
                <p class="text-xs uppercase font-black text-slate-600">No hay tareas ${window.currentNotasFilter === 'ejecutadas' ? 'tachadas' : 'pendientes'} en esta vista</p>
                <p class="text-[11px] text-slate-400 mt-1 font-normal">Escribe una tarea arriba y presiona Enter para registrarla en 1 segundo.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(t => {
        const isDone = t.status === 'EJECUTADA';
        const friendlyDate = formatFriendlyDate(t.date);

        // Estilos según prioridad
        let prioBadge = '';
        if (t.priority === 'URGENTE') {
            prioBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300">🔴 URGENTE</span>`;
        } else if (t.priority === 'REPUESTO') {
            prioBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300">📦 REPUESTO</span>`;
        } else if (t.priority === 'LLAMADA') {
            prioBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">📞 LLAMADA</span>`;
        } else if (t.priority === 'TALLER') {
            prioBadge = `<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 text-purple-900 border border-purple-300">🏢 TALLER</span>`;
        }

        return `
            <div class="group p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 shadow-2xs ${
                isDone 
                    ? 'bg-slate-50/70 border-slate-200 opacity-60' 
                    : friendlyDate.isOverdue
                        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 hover:shadow-xs'
                        : friendlyDate.isToday
                            ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-xs'
                            : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs'
            }">
                <!-- Checkbox y Contenido -->
                <div class="flex items-start gap-3 min-w-0 flex-1">
                    <!-- Checkbox de Tachar -->
                    <button type="button" onclick="toggleTaskStatus('${t.id}')" class="mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 ${
                        isDone 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                            : 'bg-white border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-300'
                    }" title="${isDone ? 'Desmarcar / reactivar tarea' : 'Marcar como ejecutada (tachar)'}">
                        <svg class="w-3.5 h-3.5 fill-current stroke-current stroke-2" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                        </svg>
                    </button>

                    <!-- Texto y Metadatos -->
                    <div class="min-w-0 flex-1">
                        <p onclick="editTaskText('${t.id}')" class="text-xs sm:text-sm font-bold text-slate-800 break-words cursor-pointer hover:text-indigo-700 transition-colors ${
                            isDone ? 'line-through text-slate-400' : ''
                        }" title="Clic para editar texto">
                            ${t.text}
                        </p>

                        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                            ${prioBadge}
                            
                            <!-- Badge de Fecha con Selector Rápido al hacer clic -->
                            <div class="relative inline-flex items-center">
                                <span class="px-2 py-0.5 rounded-lg text-[9px] font-mono border cursor-pointer ${friendlyDate.color}" title="Clic para cambiar la fecha de esta tarea">
                                    ${friendlyDate.label}
                                </span>
                                <input type="date" value="${t.date || ''}" onchange="changeTaskDate('${t.id}', this.value)" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Cambiar fecha">
                            </div>

                            ${t.completedAt ? `
                                <span class="text-[9px] text-emerald-600 font-medium">
                                    ✓ Ejecutada ${new Date(t.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button type="button" onclick="editTaskText('${t.id}')" class="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs" title="Editar texto">
                        ✏️
                    </button>
                    <button type="button" onclick="deleteQuickTask('${t.id}')" class="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all text-xs" title="Eliminar tarea">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
};
