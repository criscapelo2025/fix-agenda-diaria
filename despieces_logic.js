/**
 * GESTOR DE DESPIECES Y MANUALES TÉCNICOS EN GOOGLE DRIVE
 * Incrustación y navegación de carpetas de despieces y diagramas (9 GB de información técnica).
 */

(function() {
    const STORAGE_KEY_URL = 'fix_despieces_drive_url';
    const STORAGE_KEY_ID = 'fix_despieces_folder_id';
    const FIREBASE_CONFIG_PATH = 'app_config/despieces_drive';

    let currentDriveUrl = '';
    let currentFolderId = '';
    let currentViewMode = 'grid'; // 'grid' | 'list'

    try {
        currentDriveUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
        currentFolderId = localStorage.getItem(STORAGE_KEY_ID) || '';
    } catch(e) {}

    // Extraer Folder ID de cualquier formato de enlace de Google Drive
    function extractFolderId(input) {
        if (!input) return '';
        input = input.trim();

        // 1. Si viene en formato /folders/ID
        const folderMatch = input.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (folderMatch && folderMatch[1]) return folderMatch[1];

        // 2. Si viene con parámetro id=ID
        const idMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) return idMatch[1];

        // 3. Si viene como enlace corto o directo /d/ID
        const dMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (dMatch && dMatch[1]) return dMatch[1];

        // 4. Si el usuario pegó directamente el ID alfanumérico (ej: 1aB2c3D4e5...)
        if (/^[a-zA-Z0-9_-]{20,}$/.test(input)) {
            return input;
        }

        return '';
    }

    // Inicializar escucha en Firebase para sincronizar entre todos los dispositivos (Admin y Técnicos)
    function initFirebaseSync() {
        if (typeof database !== 'undefined' && database.ref) {
            database.ref(FIREBASE_CONFIG_PATH).on('value', function(snapshot) {
                const val = snapshot.val();
                if (val && val.folderId) {
                    currentDriveUrl = val.url || currentDriveUrl;
                    currentFolderId = val.folderId;
                    try {
                        localStorage.setItem(STORAGE_KEY_URL, currentDriveUrl);
                        localStorage.setItem(STORAGE_KEY_ID, currentFolderId);
                    } catch(e) {}
                    if (window.currentView === 'despieces') {
                        window.renderDespiecesView();
                    }
                }
            });
        }
    }

    // Ejecutar sincronización al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFirebaseSync);
    } else {
        setTimeout(initFirebaseSync, 1000);
    }

    // Renderizar la vista principal
    window.renderDespiecesView = function() {
        const container = document.getElementById('despiecesView');
        if (!container) return;

        try {
            currentDriveUrl = localStorage.getItem(STORAGE_KEY_URL) || currentDriveUrl || '';
            currentFolderId = localStorage.getItem(STORAGE_KEY_ID) || currentFolderId || '';
        } catch(e) {}

        if (!currentFolderId) {
            renderSetupScreen(container);
        } else {
            renderDriveViewer(container);
        }
    };

    // 1. Pantalla de Configuración Inicial (cuando aún no se ha pegado el enlace)
    function renderSetupScreen(container) {
        container.innerHTML = `
            <div class="glass-card p-6 md:p-10 rounded-3xl font-black uppercase shadow-2xl border border-white/90 max-w-4xl mx-auto space-y-6">
                
                <div class="text-center pb-6 border-b border-stone-200">
                    <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center text-4xl shadow-lg mb-4">
                        📚
                    </div>
                    <span class="bg-teal-900 text-white text-[10px] px-3 py-1 rounded-full font-black tracking-wider">
                        BIBLIOTECA TÉCNICA TEKA • 9 GB
                    </span>
                    <h2 class="text-2xl md:text-3xl font-black uppercase italic text-fix-main mt-3 tracking-tight">
                        Conectar Carpeta de Despieces (Google Drive)
                    </h2>
                    <p class="text-xs text-stone-500 font-bold normal-case mt-1 max-w-xl mx-auto">
                        Pega el enlace de tu carpeta de Google Drive para acceder a todos los despieces, diagramas y manuales técnicos directamente en esta pestaña.
                    </p>
                </div>

                <!-- Formulario de Conexión -->
                <div class="bg-stone-50/80 p-6 md:p-8 rounded-2xl border border-stone-200 space-y-4">
                    <label class="block text-xs font-black text-stone-800 uppercase tracking-tight">
                        🔗 Enlace o ID de la Carpeta de Google Drive:
                    </label>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input type="text" id="despiecesDriveInputSetup" placeholder="Pega aquí el enlace: https://drive.google.com/drive/folders/..." class="flex-1 p-4 rounded-xl glass-input text-xs font-mono font-bold text-stone-800 border border-stone-300 outline-none bg-white shadow-inner focus:border-teal-500">
                        <button type="button" onclick="window.saveDespiecesDriveFromInput('despiecesDriveInputSetup')" class="px-6 py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0">
                            <span>💾</span>
                            <span>Guardar y Conectar</span>
                        </button>
                    </div>
                    <p class="text-[10px] text-stone-500 font-normal normal-case">
                        Se admite cualquier enlace compartido de carpeta de Google Drive o el ID directo de la carpeta.
                    </p>
                </div>

                <!-- Guía rápida de cómo obtener el enlace -->
                <div class="bg-indigo-50/60 p-6 rounded-2xl border border-indigo-100 space-y-3">
                    <h4 class="text-xs font-black text-indigo-950 uppercase flex items-center gap-2">
                        <span>💡</span> Pasos sencillos para obtener tu enlace en Google Drive:
                    </h4>
                    <ol class="space-y-2 text-xs font-normal normal-case text-indigo-900 list-decimal list-inside">
                        <li>En tu computadora o celular, abre <a href="https://drive.google.com" target="_blank" class="font-bold underline text-indigo-700">Google Drive</a> y busca tu carpeta de 9 GB de despieces.</li>
                        <li>Haz <strong>clic derecho</strong> en la carpeta y selecciona <strong>Compartir ➔ Compartir</strong>.</li>
                        <li>En la sección <em>Acceso general</em>, cámbialo a <strong>"Cualquier persona con el enlace"</strong> (con rol <em>Lector</em>).</li>
                        <li>Haz clic en <strong>Copiar enlace</strong>, vuelve a esta casilla, <strong>pégalo</strong> y pulsa <strong>Guardar y Conectar</strong>.</li>
                    </ol>
                </div>

            </div>
        `;
    }

    // 2. Pantalla con el Visor Activo
    function renderDriveViewer(container) {
        const embedUrl = `https://drive.google.com/embeddedfolderview?id=${currentFolderId}#${currentViewMode}`;
        const externalUrl = currentDriveUrl.startsWith('http') ? currentDriveUrl : `https://drive.google.com/drive/folders/${currentFolderId}`;

        container.innerHTML = `
            <div class="glass-card p-4 md:p-6 rounded-3xl font-black uppercase shadow-xl border border-white/90 space-y-4">
                
                <!-- Barra Superior de Controles -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-stone-200">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="bg-teal-700 text-white text-[9px] px-2.5 py-0.5 rounded-lg font-black tracking-wider flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                GOOGLE DRIVE CONECTADO
                            </span>
                            <span class="text-xs text-stone-500 font-bold">BIBLIOTECA 9 GB • TEKA OFICIAL</span>
                        </div>
                        <h2 class="text-xl md:text-2xl font-black uppercase italic text-fix-main mt-1 tracking-tight flex items-center gap-2">
                            📚 Despieces, Manuales y Diagramas Técnicos
                        </h2>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                        <!-- Alternar Vista Cuadrícula / Lista -->
                        <div class="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
                            <button type="button" onclick="window.setDespiecesViewMode('grid')" class="px-3 py-1.5 rounded-lg font-bold uppercase transition-all flex items-center gap-1 ${currentViewMode === 'grid' ? 'bg-white text-teal-800 shadow-sm font-black' : 'text-stone-600 hover:text-stone-900'}">
                                <span>▦</span> <span>Cuadrícula</span>
                            </button>
                            <button type="button" onclick="window.setDespiecesViewMode('list')" class="px-3 py-1.5 rounded-lg font-bold uppercase transition-all flex items-center gap-1 ${currentViewMode === 'list' ? 'bg-white text-teal-800 shadow-sm font-black' : 'text-stone-600 hover:text-stone-900'}">
                                <span>☰</span> <span>Lista</span>
                            </button>
                        </div>

                        <!-- Recargar Visor -->
                        <button type="button" onclick="window.reloadDespiecesViewer()" class="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black uppercase transition-all flex items-center gap-1 active:scale-95 border border-stone-200 shadow-xs" title="Recargar contenido">
                            <span>🔄</span> <span>Recargar</span>
                        </button>

                        <!-- Abrir en Pestaña Externa de Drive -->
                        <a href="${externalUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-sm active:scale-95" title="Abrir carpeta directamente en Google Drive">
                            <span>↗️</span> <span>Abrir en Drive</span>
                        </a>

                        <!-- Configurar / Cambiar Enlace -->
                        <button type="button" onclick="window.openConfigDespiecesModal()" class="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black uppercase transition-all flex items-center gap-1.5 active:scale-95 border border-amber-200 shadow-xs" title="Cambiar enlace de la carpeta de Drive">
                            <span>⚙️</span> <span>Configurar</span>
                        </button>
                    </div>
                </div>

                <!-- Marco del Visor de Google Drive -->
                <div class="relative w-full rounded-2xl overflow-hidden border-2 border-stone-200/90 shadow-inner bg-stone-100">
                    <iframe id="iframeDespiecesDrive" 
                            src="${embedUrl}" 
                            class="w-full h-[75vh] min-h-[580px] border-0 rounded-2xl bg-white" 
                            allow="fullscreen" 
                            loading="lazy">
                    </iframe>
                </div>

                <!-- Barra de Consejos para Técnicos -->
                <div class="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2">
                        <span class="text-base">💡</span>
                        <span class="text-stone-300 font-normal normal-case">
                            <strong>Tip:</strong> Puedes navegar por subcarpetas, usar la lupa de Drive para buscar códigos de modelo (ej: <em>HLB 840</em>, <em>EFX 70</em>), o hacer doble clic en cualquier PDF para verlo en pantalla completa.
                        </span>
                    </div>
                    <span class="text-[9px] font-mono text-teal-300 uppercase shrink-0">9 GB DISPONIBLES</span>
                </div>

            </div>

            <!-- Modal de Edición de Enlace de Drive -->
            <div id="modalEditDespiecesDrive" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="glass-card bg-white p-6 md:p-8 rounded-3xl max-w-lg w-full font-black uppercase shadow-2xl border border-white/90 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-stone-200">
                        <h3 class="text-sm font-black text-stone-900 flex items-center gap-2">
                            <span>⚙️</span> Configurar Enlace de Google Drive
                        </h3>
                        <button type="button" onclick="window.closeConfigDespiecesModal()" class="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-black">
                            ✕
                        </button>
                    </div>
                    <div>
                        <label class="block text-xs font-black text-stone-700 uppercase mb-2">
                            Enlace o ID de la Carpeta de Despieces:
                        </label>
                        <input type="text" id="despiecesDriveInputModal" value="${currentDriveUrl || currentFolderId}" placeholder="Pega el nuevo enlace aquí..." class="w-full p-4 rounded-xl glass-input text-xs font-mono font-bold text-stone-800 border border-stone-300 outline-none bg-stone-50 shadow-inner">
                        <p class="text-[9.5px] text-stone-500 font-normal normal-case mt-1.5">
                            Al guardar, el cambio se sincronizará automáticamente para ti y para todos los técnicos del sistema.
                        </p>
                    </div>
                    <div class="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
                        <button type="button" onclick="window.closeConfigDespiecesModal()" class="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-black uppercase transition-all">
                            Cancelar
                        </button>
                        <button type="button" onclick="window.saveDespiecesDriveFromInput('despiecesDriveInputModal')" class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase transition-all shadow-md flex items-center gap-1.5">
                            <span>💾</span> <span>Guardar Cambios</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Guardar URL desde un input dado por ID
    window.saveDespiecesDriveFromInput = function(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const val = input.value.trim();
        if (!val) {
            if (typeof showMessage === 'function') showMessage("⚠️ Ingrese un enlace válido de Google Drive", "fix-accent");
            return;
        }

        const folderId = extractFolderId(val);
        if (!folderId) {
            if (typeof showMessage === 'function') {
                showMessage("❌ No se reconoció un ID de carpeta válido. Asegúrese de copiar el enlace de Google Drive completo.", "fix-error");
            } else {
                alert("No se reconoció un ID de carpeta válido de Google Drive.");
            }
            return;
        }

        currentDriveUrl = val;
        currentFolderId = folderId;

        try {
            localStorage.setItem(STORAGE_KEY_URL, currentDriveUrl);
            localStorage.setItem(STORAGE_KEY_ID, currentFolderId);
        } catch(e) {}

        // Guardar en Firebase para que los técnicos también lo tengan
        if (typeof database !== 'undefined' && database.ref) {
            database.ref(FIREBASE_CONFIG_PATH).set({
                url: currentDriveUrl,
                folderId: currentFolderId,
                updatedAt: new Date().toISOString()
            }).then(() => {
                if (typeof showMessage === 'function') showMessage("✅ Carpeta de Despieces Sincronizada", "fix-report");
            }).catch(e => {
                console.warn("Error guardando en Firebase:", e);
                if (typeof showMessage === 'function') showMessage("✅ Carpeta Guardada Localmente", "fix-report");
            });
        } else {
            if (typeof showMessage === 'function') showMessage("✅ Carpeta de Despieces Conectada", "fix-report");
        }

        window.closeConfigDespiecesModal();
        window.renderDespiecesView();
    };

    // Cambiar modo de vista (#grid o #list)
    window.setDespiecesViewMode = function(mode) {
        currentViewMode = mode;
        const iframe = document.getElementById('iframeDespiecesDrive');
        if (iframe && currentFolderId) {
            iframe.src = `https://drive.google.com/embeddedfolderview?id=${currentFolderId}#${mode}`;
        }
        window.renderDespiecesView();
    };

    // Recargar el iframe
    window.reloadDespiecesViewer = function() {
        const iframe = document.getElementById('iframeDespiecesDrive');
        if (iframe && currentFolderId) {
            const currentSrc = iframe.src;
            iframe.src = '';
            setTimeout(() => { iframe.src = currentSrc; }, 100);
            if (typeof showMessage === 'function') showMessage("🔄 Visor Recargado", "fix-main");
        }
    };

    // Modal abrir / cerrar
    window.openConfigDespiecesModal = function() {
        const modal = document.getElementById('modalEditDespiecesDrive');
        if (modal) modal.classList.remove('hidden');
    };

    window.closeConfigDespiecesModal = function() {
        const modal = document.getElementById('modalEditDespiecesDrive');
        if (modal) modal.classList.add('hidden');
    };

})();
