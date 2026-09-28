/**
 * BASE DE DATOS OFICIAL TEKA - ERRORES Y CONFIGURACIÓN DE COCINAS DE INDUCCIÓN
 * Fuente: Nota Técnica Oficial NTEH15017 ES (05/08/2019)
 * G0 / G1 / G1+ / G2 / G3
 */

window.TEKA_INDUCTION_ERRORS = [
    {
        "codigo": "F 01",
        "codigoLimpio": "F01",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Pista fusible abierta",
        "solucion": "Cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 02",
        "codigoLimpio": "F02",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Sobretensión",
        "solucion": "Revisar tensión de red",
        "pasosDiagnostico": [
            "Medir voltaje con multímetro entre fase y neutro (110V/220V nominal según modelo).",
            "Verificar si existen caídas o fluctuaciones bruscas de tensión en el tablero eléctrico.",
            "Comprobar estado del breaker y calibre de cableado de alimentación."
        ]
    },
    {
        "codigo": "F 04",
        "codigoLimpio": "F04",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Baja tensión",
        "solucion": "Revisar tensión de red",
        "pasosDiagnostico": [
            "Medir voltaje con multímetro entre fase y neutro (110V/220V nominal según modelo).",
            "Verificar si existen caídas o fluctuaciones bruscas de tensión en el tablero eléctrico.",
            "Comprobar estado del breaker y calibre de cableado de alimentación."
        ]
    },
    {
        "codigo": "F 05",
        "codigoLimpio": "F05",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en generador: Fallo en driver del IGBT",
        "solucion": "Cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 06",
        "codigoLimpio": "F06",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Frecuencia de red incorrecta",
        "solucion": "Comprobar frecuencia de red.",
        "pasosDiagnostico": [
            "Medir voltaje con multímetro entre fase y neutro (110V/220V nominal según modelo).",
            "Verificar si existen caídas o fluctuaciones bruscas de tensión en el tablero eléctrico.",
            "Comprobar estado del breaker y calibre de cableado de alimentación."
        ]
    },
    {
        "codigo": "F 07",
        "codigoLimpio": "F07",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Relé pegado abierto",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 08",
        "codigoLimpio": "F08",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en generador: Fallo en el circuito de lectura de la Vce",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 12",
        "codigoLimpio": "F12",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Bobina Inductora / Sonda",
        "descripcion": "Error en generador (corriente baja en bobina)",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Verificar conexión del sensor NTC de temperatura sobre el núcleo de la bobina.",
            "Medir resistencia de la sonda NTC a temperatura ambiente.",
            "Comprobar aislamiento y conexiones de potencia de la bobina al generador."
        ]
    },
    {
        "codigo": "F 21",
        "codigoLimpio": "F21",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Frecuencia de red incorrecta",
        "solucion": "Comprobar si frecuencia red es correcta",
        "pasosDiagnostico": [
            "Medir voltaje con multímetro entre fase y neutro (110V/220V nominal según modelo).",
            "Verificar si existen caídas o fluctuaciones bruscas de tensión en el tablero eléctrico.",
            "Comprobar estado del breaker y calibre de cableado de alimentación."
        ]
    },
    {
        "codigo": "F 25",
        "codigoLimpio": "F25",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Ventilador de Refrigeración",
        "descripcion": "Ventilador estropeado",
        "solucion": "Cambiar ventilador",
        "pasosDiagnostico": [
            "Desconectar la cocina de red y comprobar giro libre del ventilador (sin obstrucciones de grasa/suciedad).",
            "Comprobar conector de alimentación del ventilador en la placa generadora.",
            "Sustituir ventilador si persiste el bloqueo o circuito abierto."
        ]
    },
    {
        "codigo": "F 34",
        "codigoLimpio": "F34",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error sensor temperatura del disipador, temperatura demasiado alta",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 35",
        "codigoLimpio": "F35",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error sensor temperatura del disipador, temperatura demasiado baja",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 36",
        "codigoLimpio": "F36",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Bobina Inductora / Sonda",
        "descripcion": "Fallo en sensor bobina",
        "solucion": "Cambiar bobina",
        "pasosDiagnostico": [
            "Verificar conexión del sensor NTC de temperatura sobre el núcleo de la bobina.",
            "Medir resistencia de la sonda NTC a temperatura ambiente.",
            "Comprobar aislamiento y conexiones de potencia de la bobina al generador."
        ]
    },
    {
        "codigo": "F 37",
        "codigoLimpio": "F37",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Bobina Inductora / Sonda",
        "descripcion": "Mala conexión sensor temperatura bobina, sensor sin conectar, error temperatura demasiado baja",
        "solucion": "Revisar conexión sensor / cambiar bobina",
        "pasosDiagnostico": [
            "Verificar conexión del sensor NTC de temperatura sobre el núcleo de la bobina.",
            "Medir resistencia de la sonda NTC a temperatura ambiente.",
            "Comprobar aislamiento y conexiones de potencia de la bobina al generador."
        ]
    },
    {
        "codigo": "F 40",
        "codigoLimpio": "F40",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en generador",
        "solucion": "Cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 42",
        "codigoLimpio": "F42",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Sobretensión",
        "solucion": "Revisar tensión de red",
        "pasosDiagnostico": [
            "Medir voltaje con multímetro entre fase y neutro (110V/220V nominal según modelo).",
            "Verificar si existen caídas o fluctuaciones bruscas de tensión en el tablero eléctrico.",
            "Comprobar estado del breaker y calibre de cableado de alimentación."
        ]
    },
    {
        "codigo": "F 43",
        "codigoLimpio": "F43",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Baja tensión",
        "solucion": "Revisar tensión de red",
        "pasosDiagnostico": [
            "Medir voltaje con multímetro entre fase y neutro (110V/220V nominal según modelo).",
            "Verificar si existen caídas o fluctuaciones bruscas de tensión en el tablero eléctrico.",
            "Comprobar estado del breaker y calibre de cableado de alimentación."
        ]
    },
    {
        "codigo": "F 47",
        "codigoLimpio": "F47",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Touch Control (Panel Táctil)",
        "descripcion": "Error comunicación TC generador",
        "solucion": "Revisar conexiones (ojo a conexión cable IPC a TC) y jumper de direccionamiento. Resetear",
        "pasosDiagnostico": [
            "Desconectar de la red 10 segundos y reconectar para resetear el bus IPC.",
            "Inspeccionar minuciosamente el cable cinta IPC plano entre el Touch Control y la placa generadora.",
            "Verificar posición correcta de los jumpers de direccionamiento.",
            "Si el error persiste, revisar conector y descartar fallo en placa generadora o TC."
        ]
    },
    {
        "codigo": "F 56",
        "codigoLimpio": "F56",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Touch Control (Panel Táctil)",
        "descripcion": "Configuración TC incorrecta",
        "solucion": "Repetir configuración",
        "pasosDiagnostico": [
            "El Touch Control o Generador no tienen grabado el código de configuración de la placa.",
            "Acceder al menú de configuración del Touch Control dentro de los primeros 60 segundos tras conectar a red.",
            "Consultar el código de configuración específico del modelo en la tabla y confirmarlo con el candado."
        ]
    },
    {
        "codigo": "F 58",
        "codigoLimpio": "F58",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Configuración generador incorrecta",
        "solucion": "Repetir configuración",
        "pasosDiagnostico": [
            "El Touch Control o Generador no tienen grabado el código de configuración de la placa.",
            "Acceder al menú de configuración del Touch Control dentro de los primeros 60 segundos tras conectar a red.",
            "Consultar el código de configuración específico del modelo en la tabla y confirmarlo con el candado."
        ]
    },
    {
        "codigo": "F 59",
        "codigoLimpio": "F59",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Touch Control (Panel Táctil)",
        "descripcion": "Sensor del touch fuera de rango",
        "solucion": "Reiniciar. Si persiste, sustituir touch control.",
        "pasosDiagnostico": [
            "Reiniciar alimentación cortando la energía durante 10 segundos.",
            "Limpiar minuciosamente el cristal superior sobre el área de los sensores táctiles.",
            "Si persiste, verificar alimentación de 5V hacia el Touch Control o sustituir la placa táctil."
        ]
    },
    {
        "codigo": "F 60",
        "codigoLimpio": "F60",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Touch Control (Panel Táctil)",
        "descripcion": "Error en TC",
        "solucion": "Cambiar TC",
        "pasosDiagnostico": [
            "Reiniciar alimentación cortando la energía durante 10 segundos.",
            "Limpiar minuciosamente el cristal superior sobre el área de los sensores táctiles.",
            "Si persiste, verificar alimentación de 5V hacia el Touch Control o sustituir la placa táctil."
        ]
    },
    {
        "codigo": "F 61",
        "codigoLimpio": "F61",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en el generador: Fallo en los Registros del Microprocesador",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 62",
        "codigoLimpio": "F62",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en el generador: Fallo en la memoria RAM del Microprocesador",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 63",
        "codigoLimpio": "F63",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en el generador: Fallo en la memoria Flash del Microprocesador",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 72",
        "codigoLimpio": "F72",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en el generador : Fallo de clase B",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 74",
        "codigoLimpio": "F74",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Generador de Inducción",
        "descripcion": "Error en el generador. Fallo en el contador de programa",
        "solucion": "Reiniciar. Si persiste, cambiar generador",
        "pasosDiagnostico": [
            "Desconectar la placa de la red eléctrica durante 10 a 15 segundos y volver a conectar.",
            "Si la anomalía persiste inmediatamente, revisar estado de la placa generadora de inducción.",
            "Sustituir el módulo generador de inducción afectado."
        ]
    },
    {
        "codigo": "F 76",
        "codigoLimpio": "F76",
        "tipo": "Fallo Crítico / Electrónico",
        "severidad": "error",
        "componente": "Bobina Inductora / Sonda",
        "descripcion": "Error en el sensor de temperatura de la bobina, temperatura fija",
        "solucion": "Cambiar bobina",
        "pasosDiagnostico": [
            "Verificar conexión del sensor NTC de temperatura sobre el núcleo de la bobina.",
            "Medir resistencia de la sonda NTC a temperatura ambiente.",
            "Comprobar aislamiento y conexiones de potencia de la bobina al generador."
        ]
    },
    {
        "codigo": "C 81",
        "codigoLimpio": "C81",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Generador de Inducción",
        "descripcion": "Sobrecalentamiento de la electrónica",
        "solucion": "Dejar enfriar",
        "pasosDiagnostico": [
            "Permitir que la encimera se enfríe completamente con el ventilador en funcionamiento.",
            "Verificar que las rejillas de ventilación del mueble inferior no estén obstruidas y cumplan con la separación requerida.",
            "Comprobar que el ventilador no esté bloqueado o con revoluciones deficientes."
        ]
    },
    {
        "codigo": "C 82",
        "codigoLimpio": "C82",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Bobina Inductora / Sonda",
        "descripcion": "Sobrecalentamiento de la bobina",
        "solucion": "Dejar enfriar",
        "pasosDiagnostico": [
            "Permitir que la encimera se enfríe completamente con el ventilador en funcionamiento.",
            "Verificar que las rejillas de ventilación del mueble inferior no estén obstruidas y cumplan con la separación requerida.",
            "Comprobar que el ventilador no esté bloqueado o con revoluciones deficientes."
        ]
    },
    {
        "codigo": "C 83",
        "codigoLimpio": "C83",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Bobina Inductora / Sonda",
        "descripcion": "Bloqueo del sensor de la bobina",
        "solucion": "Dejar enfriar bobina. Si persiste cambiarla",
        "pasosDiagnostico": [
            "Dejar enfriar o reiniciar el equipo.",
            "Verificar estabilidad del suministro eléctrico."
        ]
    },
    {
        "codigo": "C 84",
        "codigoLimpio": "C84",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Red Eléctrica / Suministro",
        "descripcion": "Error señal de red: forma distorsionada",
        "solucion": "Revisar tensión de red",
        "pasosDiagnostico": [
            "Dejar enfriar o reiniciar el equipo.",
            "Verificar estabilidad del suministro eléctrico."
        ]
    },
    {
        "codigo": "C 85",
        "codigoLimpio": "C85",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Menaje / Recipiente",
        "descripcion": "Recipiente utilizado no válido para dicha placa",
        "solucion": "Cambiar recipiente o posición del mismo",
        "pasosDiagnostico": [
            "El recipiente no contiene material ferromagnético adecuado o su base es inferior al diámetro mínimo de la zona.",
            "Probar con un imán en la base del utensilio para verificar compatibilidad de inducción.",
            "Centrar adecuadamente el recipiente sobre la serigrafía de la zona de cocción."
        ]
    },
    {
        "codigo": "C 90",
        "codigoLimpio": "C90",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Touch Control (Panel Táctil)",
        "descripcion": "Sensores cubierto (fallo externo)",
        "solucion": "Limpiar touch control",
        "pasosDiagnostico": [
            "Limpiar con un paño seco y suave la superficie de cristal sobre los sensores táctiles.",
            "Retirar objetos, líquidos derramados o recipientes posados sobre el panel de control."
        ]
    },
    {
        "codigo": "C91",
        "codigoLimpio": "C91",
        "tipo": "Aviso Operacional / Protección",
        "severidad": "warning",
        "componente": "Touch Control (Panel Táctil)",
        "descripcion": "Sensor Stop&go cubierto o dañado (touch control tipo V)",
        "solucion": "Limpiar touch y si persiste sustituir.",
        "pasosDiagnostico": [
            "Limpiar a fondo el área del sensor Stop&Go (Touch Control Tipo V).",
            "Verificar que no existan rayones profundos ni humedad bajo el cristal.",
            "Si el aviso persiste tras la limpieza, sustituir el módulo touch control."
        ]
    }
];

window.TEKA_INDUCTION_MODELS = [
    {
        "codProducto": "-",
        "modelo": "EKI 6130.0",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 6130.0 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 6140.0",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 6140.0 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 6330.0F",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 6330.0M",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 8030.0 F",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "66",
        "notas": ""
    },
    {
        "codProducto": "-",
        "modelo": "EKI 9330.0F",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "112520004",
        "modelo": "GIC 633",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "112520004",
        "modelo": "GIC 633",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10208055",
        "modelo": "GKI 630",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208055",
        "modelo": "GKI 630 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10210189",
        "modelo": "IB 3200",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210189",
        "modelo": "IB 3200 VR01",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "56",
        "notas": ""
    },
    {
        "codProducto": "10210049",
        "modelo": "IB 321",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210023",
        "modelo": "IB 600",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "38",
        "notas": ""
    },
    {
        "codProducto": "10210120",
        "modelo": "IB 6009",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210118",
        "modelo": "IB 6017",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210066",
        "modelo": "IB 6030",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210104",
        "modelo": "IB 6031",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210068",
        "modelo": "IB 6040",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10210019",
        "modelo": "IB 610",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "50",
        "notas": ""
    },
    {
        "codProducto": "10210134",
        "modelo": "IB 6130",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210136",
        "modelo": "IB 6131",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210133",
        "modelo": "IB 6140",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10210100",
        "modelo": "IB 6210",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10208084",
        "modelo": "IB 630",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208084",
        "modelo": "IB 630 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10210035",
        "modelo": "IB 6300",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10210211",
        "modelo": "IB 6304",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210195",
        "modelo": "IB 6307",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210210",
        "modelo": "IB 6308",
        "generacion": "G0",
        "touchControl": "Tip o V",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210193",
        "modelo": "IB 6309",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210043",
        "modelo": "IB 631",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10210157",
        "modelo": "IB 6310",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210198",
        "modelo": "IB 6311",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210158",
        "modelo": "IB 6315",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210212",
        "modelo": "IB 6320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210160",
        "modelo": "IB 641",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10210160",
        "modelo": "IB 641 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10210160",
        "modelo": "IB 6415",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10210186",
        "modelo": "IB 9530",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "60",
        "notas": ""
    },
    {
        "codProducto": "10210203",
        "modelo": "IB 9530 ANTHRACITE",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "60",
        "notas": ""
    },
    {
        "codProducto": "10210203",
        "modelo": "IB 9530 ANTHRACITE VR01",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "60 (Módulo",
        "notas": "60 (Módulo"
    },
    {
        "codProducto": "10210186",
        "modelo": "IB 9530 VR01",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "60 (Módulo",
        "notas": "60 (Módulo"
    },
    {
        "codProducto": "112520002",
        "modelo": "IBC 63001 TCS",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "112520002",
        "modelo": "IBC 63001 TCS",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "112520005",
        "modelo": "IBC 63002 TTC (50801451)",
        "generacion": "G0",
        "touchControl": "Tipo Ix",
        "codConf": "12",
        "notas": ""
    },
    {
        "codProducto": "112520006",
        "modelo": "IBC 63010 MSS (50801452)",
        "generacion": "G0",
        "touchControl": "Tipo Ix",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "112520008",
        "modelo": "IBC 63900 TTC (50801453)",
        "generacion": "G0",
        "touchControl": "Tipo Ix",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "112520007",
        "modelo": "IBC 64000 TTC (50801450)",
        "generacion": "G0",
        "touchControl": "Tipo Ix",
        "codConf": "04",
        "notas": ""
    },
    {
        "codProducto": "10210125",
        "modelo": "IBR 6040",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10210125",
        "modelo": "IBR 6040 VR01",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10208696",
        "modelo": "IBR 641",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10208696",
        "modelo": "IBR 641 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "05",
        "notas": ""
    },
    {
        "codProducto": "10210074",
        "modelo": "IBS 641",
        "generacion": "G1+",
        "touchControl": "Tipo Iv",
        "codConf": "05",
        "notas": ""
    },
    {
        "codProducto": "112520011",
        "modelo": "IBW 64010 TTC (50801450)",
        "generacion": "G0",
        "touchControl": "Tipo Ix",
        "codConf": "04",
        "notas": ""
    },
    {
        "codProducto": "10210138",
        "modelo": "ILM 6030",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210045",
        "modelo": "IP 631",
        "generacion": "G1+",
        "touchControl": "Tipo Iv",
        "codConf": "00",
        "notas": ""
    },
    {
        "codProducto": "10210050",
        "modelo": "IPF 641",
        "generacion": "G1+",
        "touchControl": "Tipo Iv",
        "codConf": "06",
        "notas": ""
    },
    {
        "codProducto": "10210011",
        "modelo": "IQS 633",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "10210011",
        "modelo": "IQS 633 VR01",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "6 3",
        "notas": ""
    },
    {
        "codProducto": "10210020",
        "modelo": "IQS 643",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "64",
        "notas": ""
    },
    {
        "codProducto": "10210171",
        "modelo": "IR 3200",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210171",
        "modelo": "IR 3200 VR01",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Iv",
        "codConf": "56",
        "notas": ""
    },
    {
        "codProducto": "10208093",
        "modelo": "IR 321",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10208111",
        "modelo": "IR 321 (CHINA)",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210169",
        "modelo": "IR 4200",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "24",
        "notas": ""
    },
    {
        "codProducto": "10210169",
        "modelo": "IR 4200 VR01",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "57",
        "notas": ""
    },
    {
        "codProducto": "10210017",
        "modelo": "IR 421",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo Vi",
        "codConf": "24",
        "notas": ""
    },
    {
        "codProducto": "10210167",
        "modelo": "IR 5300",
        "generacion": "G2",
        "touchControl": "Tipo Iii",
        "codConf": "11",
        "notas": ""
    },
    {
        "codProducto": "10208080",
        "modelo": "IR 531",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "44",
        "notas": ""
    },
    {
        "codProducto": "10208080",
        "modelo": "IR 531 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "03",
        "notas": ""
    },
    {
        "codProducto": "10210065",
        "modelo": "IR 6030",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "10210103",
        "modelo": "IR 6031",
        "generacion": "G0",
        "touchControl": "Ti po III",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210117",
        "modelo": "IR 6037",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210119",
        "modelo": "IR 6039",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210067",
        "modelo": "IR 6040",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10208057",
        "modelo": "IR 609",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208057",
        "modelo": "IR 609 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208057",
        "modelo": "IR 609 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "00",
        "notas": ""
    },
    {
        "codProducto": "10210018",
        "modelo": "IR 610",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "50",
        "notas": ""
    },
    {
        "codProducto": "10210135",
        "modelo": "IR 6131",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210132",
        "modelo": "IR 6140",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10208058",
        "modelo": "IR 617",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208058",
        "modelo": "IR 617 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208058",
        "modelo": "IR 617 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "00",
        "notas": ""
    },
    {
        "codProducto": "10208056",
        "modelo": "IR 621",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208056",
        "modelo": "IR 621 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208056",
        "modelo": "IR 621 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "00",
        "notas": ""
    },
    {
        "codProducto": "10210121",
        "modelo": "IR 6231",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10208050",
        "modelo": "IR 630",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208050",
        "modelo": "IR 630 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208050",
        "modelo": "IR 630 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "01",
        "notas": ""
    },
    {
        "codProducto": "10210024",
        "modelo": "IR 6300",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208034",
        "modelo": "IR 631",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208034",
        "modelo": "IR 631 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208034",
        "modelo": "IR 631 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iv",
        "codConf": "00",
        "notas": ""
    },
    {
        "codProducto": "10210025",
        "modelo": "IR 6310",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10210026",
        "modelo": "IR 6311",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208076",
        "modelo": "IR 632",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "62",
        "notas": ""
    },
    {
        "codProducto": "10208110",
        "modelo": "IR 632 (CHINA)",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "62",
        "notas": ""
    },
    {
        "codProducto": "10210174",
        "modelo": "IR 6320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10208036",
        "modelo": "IR 641",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10208036",
        "modelo": "IR 641 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10208036",
        "modelo": "IR 641 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iv",
        "codConf": "05",
        "notas": ""
    },
    {
        "codProducto": "10208079",
        "modelo": "IR 642",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "64",
        "notas": ""
    },
    {
        "codProducto": "10210116",
        "modelo": "IR 721",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "60",
        "notas": ""
    },
    {
        "codProducto": "10210166",
        "modelo": "IR 8300 HS",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "12",
        "notas": ""
    },
    {
        "codProducto": "10208059",
        "modelo": "IR 831",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "55",
        "notas": ""
    },
    {
        "codProducto": "10208058",
        "modelo": "IR 831 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "55",
        "notas": ""
    },
    {
        "codProducto": "10208059",
        "modelo": "IR 831 VR02",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "04",
        "notas": ""
    },
    {
        "codProducto": "10208059",
        "modelo": "IR 8400",
        "generacion": "G2",
        "touchControl": "Tipo Iv",
        "codConf": "14",
        "notas": ""
    },
    {
        "codProducto": "10208059",
        "modelo": "IR 8400 VR01",
        "generacion": "G2",
        "touchControl": "Tipo Iv",
        "codConf": "14",
        "notas": ""
    },
    {
        "codProducto": "10210027",
        "modelo": "IR 841",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10210164",
        "modelo": "IR 8430",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "64",
        "notas": ""
    },
    {
        "codProducto": "10210164",
        "modelo": "IR 8430 VR01",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "64 (Módulo",
        "notas": "64 (Módulo"
    },
    {
        "codProducto": "10210165",
        "modelo": "IR 9330 HS",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "10210165",
        "modelo": "IR 9330 HS VR01",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63 (Módulo SW",
        "notas": "63 (Módulo SW"
    },
    {
        "codProducto": "10210188",
        "modelo": "IR 9400 HS",
        "generacion": "G2",
        "touchControl": "Tipo Iii",
        "codConf": "13",
        "notas": ""
    },
    {
        "codProducto": "10210188",
        "modelo": "IR 9400 HS VR01",
        "generacion": "G2",
        "touchControl": "Tipo Iii",
        "codConf": "13",
        "notas": ""
    },
    {
        "codProducto": "10210109",
        "modelo": "IRS 953",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "60",
        "notas": ""
    },
    {
        "codProducto": "10210152",
        "modelo": "IRS 953 (ECUADOR)",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "60",
        "notas": ""
    },
    {
        "codProducto": "10210015",
        "modelo": "IRX 631",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208090",
        "modelo": "IRX 633",
        "generacion": "G3",
        "touchControl": "Ti po II",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "10208091",
        "modelo": "IRX 643",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "64",
        "notas": ""
    },
    {
        "codProducto": "10208089",
        "modelo": "IRX 832",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "66",
        "notas": ""
    },
    {
        "codProducto": "10210014",
        "modelo": "IRX 933 HS",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "63",
        "notas": ""
    },
    {
        "codProducto": "10208051",
        "modelo": "IT 630",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208051",
        "modelo": "IT 630 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "10208051",
        "modelo": "IT 631",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10208051",
        "modelo": "IT 631 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "45",
        "notas": ""
    },
    {
        "codProducto": "10210213",
        "modelo": "IT 6315",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10208035",
        "modelo": "IT 6320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210196",
        "modelo": "IT 6321",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210183",
        "modelo": "IT 6350 IKNOB",
        "generacion": "G2",
        "touchControl": "Tipo Viii",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10208037",
        "modelo": "IT 641",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10208037",
        "modelo": "IT 641 VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10208037",
        "modelo": "IT 642",
        "generacion": "G2",
        "touchControl": "Tipo I",
        "codConf": "64",
        "notas": ""
    },
    {
        "codProducto": "10208698",
        "modelo": "IT 6420",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "10210182",
        "modelo": "IT 6450 IKNOB",
        "generacion": "G2",
        "touchControl": "Tipo Viii",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "10210200",
        "modelo": "IT 6450 IKNOB (EC)",
        "generacion": "G2",
        "touchControl": "Tipo Viii",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "10210179",
        "modelo": "ITF 6320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "29",
        "notas": ""
    },
    {
        "codProducto": "10210073",
        "modelo": "ITS 631",
        "generacion": "G1+",
        "touchControl": "Tipo Iv",
        "codConf": "00",
        "notas": ""
    },
    {
        "codProducto": "10208699",
        "modelo": "ITS 643",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "64",
        "notas": ""
    },
    {
        "codProducto": "112500002",
        "modelo": "ITS 65600 MSP",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "49",
        "notas": ""
    },
    {
        "codProducto": "10208699",
        "modelo": "IZ 5320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "22",
        "notas": ""
    },
    {
        "codProducto": "10210159",
        "modelo": "IZ 6315",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210197",
        "modelo": "IZ 6316",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210194",
        "modelo": "IZ 6317",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210209",
        "modelo": "IZ 6318",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210192",
        "modelo": "IZ 6319",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210173",
        "modelo": "IZ 6320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "112510009",
        "modelo": "IZ 6320 LB",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "112500009",
        "modelo": "IZ 6320 SM",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "112510007",
        "modelo": "IZ 6320 ST",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "20",
        "notas": ""
    },
    {
        "codProducto": "10210206",
        "modelo": "IZ 6320 WHITE",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10210161",
        "modelo": "IZ 6415",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "16",
        "notas": ""
    },
    {
        "codProducto": "10210176",
        "modelo": "IZ 6420",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "112510010",
        "modelo": "IZ 6420 LB",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "112500010",
        "modelo": "IZ 6420 SM",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "112510008",
        "modelo": "IZ 6420 ST",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "25",
        "notas": ""
    },
    {
        "codProducto": "10210205",
        "modelo": "IZ 6420 WHITE",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "34",
        "notas": ""
    },
    {
        "codProducto": "10210202",
        "modelo": "IZ 7210",
        "generacion": "G1+",
        "touchControl": "Tipo Iii",
        "codConf": "60",
        "notas": ""
    },
    {
        "codProducto": "10210204",
        "modelo": "IZ 8320 HS",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "23",
        "notas": ""
    },
    {
        "codProducto": "112510001",
        "modelo": "IZC 32 300 DMS",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo V",
        "codConf": "01",
        "notas": ""
    },
    {
        "codProducto": "112500000",
        "modelo": "IZC 42300 DMS",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo V",
        "codConf": "02",
        "notas": ""
    },
    {
        "codProducto": "112510000",
        "modelo": "IZC 93301 MSP",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "43",
        "notas": ""
    },
    {
        "codProducto": "10210178",
        "modelo": "IZF 6320",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "29",
        "notas": ""
    },
    {
        "codProducto": "10210180",
        "modelo": "IZF 6420",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "30",
        "notas": ""
    },
    {
        "codProducto": "10210181",
        "modelo": "IZF 6424",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "31",
        "notas": ""
    },
    {
        "codProducto": "112510002",
        "modelo": "IZS 34600 DMS",
        "generacion": "G1+ Dómino",
        "touchControl": "Tipo V",
        "codConf": "03",
        "notas": ""
    },
    {
        "codProducto": "112500001",
        "modelo": "IZS 65600 MSP",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "49",
        "notas": ""
    },
    {
        "codProducto": "112500003",
        "modelo": "IZS 66700 MSP",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "50",
        "notas": ""
    },
    {
        "codProducto": "112500004",
        "modelo": "IZS 96600 MSP",
        "generacion": "G2",
        "touchControl": "Tipo V",
        "codConf": "47",
        "notas": ""
    },
    {
        "codProducto": "10210089",
        "modelo": "MIB 6030",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "112520003",
        "modelo": "MIC 63",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "112520003",
        "modelo": "MIC 63",
        "generacion": "G0",
        "touchControl": "Tipo V",
        "codConf": "19",
        "notas": ""
    },
    {
        "codProducto": "10210088",
        "modelo": "MIR 6030",
        "generacion": "G0",
        "touchControl": "Tipo Iii",
        "codConf": "15",
        "notas": ""
    },
    {
        "codProducto": "80203009",
        "modelo": "TTI 603 B",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "80203009",
        "modelo": "TTI 603 B VR01",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "80203010",
        "modelo": "TTI 603 R (THOR)",
        "generacion": "G1+",
        "touchControl": "Tipo I",
        "codConf": "48",
        "notas": ""
    },
    {
        "codProducto": "80203008",
        "modelo": "TTI 604 B",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "80203007",
        "modelo": "TTI 604 R",
        "generacion": "G1",
        "touchControl": "Tipo I",
        "codConf": "35",
        "notas": ""
    },
    {
        "codProducto": "10210069",
        "modelo": "VR TC 95 4I VR01",
        "generacion": "G3",
        "touchControl": "Tipo Ii",
        "codConf": "( **)",
        "notas": ""
    }
];

window.TEKA_TOUCH_CONTROLS = [
    {
        "id": "Tipo I",
        "nombre": "Touch Control Tipo I",
        "display": "Zonas 2 y 3",
        "sensores": "4 pulsaciones (1-2-3-4)",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos para la secuencia completa de 4 pulsaciones",
        "pasos": [
            "1. Desconectar la encimera de la red eléctrica y esperar 10 segundos.",
            "2. Volver a conectar a la tensión de red. Todos los segmentos y pilotos del TC se iluminan 2 seg y el zumbador emite un bip (test de luces y zumbador).",
            "3. Se dispone de 60 segundos tras conectar a red para acceder al menú.",
            "4. Tocar los sensores 1-2-3-4 en orden numérico (cada pulsación emite un bip). La secuencia debe completarse en menos de 5 segundos. (Si es incorrecta, sonarán 3 pitidos de error y debe repetirse desde el inicio).",
            "5. Si el acceso fue correcto, parpadeará un punto en el display de la zona 2 y aparecerá la letra C en los displays de las zonas 2 y 3.",
            "6. Pulsar el sensor del candado. Los displays de las zonas 2 y 3 parpadearán mostrando los valores de configuración actuales.",
            "7. Con los sensores +/- seleccionar el código de configuración correspondiente al modelo según la tabla.",
            "8. Confirmar el código pulsando nuevamente sobre el sensor del candado.",
            "9. Desconectar la cocina de red durante 10 segundos y volver a conectar para reiniciar con los nuevos parámetros grabados."
        ],
        "sonidoOnOff": false,
        "limitadorPotencia": false,
        "modelosEjemplo": "EKI 6130.0, IB 641 VR01, IR 610, IR 631, IT 641, TTI 603 B"
    },
    {
        "id": "Tipo II",
        "nombre": "Touch Control Tipo II",
        "display": "Zonas 2 y 3",
        "sensores": "4 pulsaciones (1-2-3-4)",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos para la secuencia",
        "pasos": [
            "1. Desconectar la encimera de la red eléctrica y esperar 10 segundos.",
            "2. Volver a conectar a la tensión de red (test visual y acústico de 2 seg).",
            "3. IMPORTANTE: Desbloquear el candado antes de continuar si está bloqueado.",
            "4. Tocar los sensores 1-2-3-4 en orden numérico dentro de los 60 seg iniciales (completar secuencia en max 5 seg).",
            "5. Si es correcto, parpadeará un punto en el display de la zona 2 y aparecerá el menú en las zonas 2 y 3.",
            "6. Pulsar el sensor del candado para activar la edición.",
            "7. Con los sensores del temporizador +/- seleccionar el código de configuración de la tabla.",
            "8. Confirmar el código pulsando sobre el sensor del candado.",
            "9. Desconectar de la red 10 segundos y reconectar."
        ],
        "sonidoOnOff": false,
        "limitadorPotencia": false,
        "modelosEjemplo": "EKI 6330.0F, IB 9530, IR 9530, IRS 953 (ECUADOR), IRX 633, ITS 643"
    },
    {
        "id": "Tipo III",
        "nombre": "Touch Control Tipo III",
        "display": "Zonas 1 y 4",
        "sensores": "5 pulsaciones",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos",
        "pasos": [
            "1. Desconectar la encimera de red y esperar 10 segundos.",
            "2. Reconectar a tensión de red (test de segmentos de 2 seg + bip).",
            "3. Dispone de 60 segundos para acceder al menú de configuración.",
            "4. Tocar los sensores indicados en la secuencia de 5 pulsaciones (max 5 seg).",
            "5. Si es correcto, aparecerá el mensaje de configuración en los displays de las zonas 1 y 4 (comunes para 3 y 4 placas).",
            "6. Pulsar el sensor del candado. Los displays 1 y 4 comenzarán a parpadear.",
            "7. Seleccionar la zona del dígito a modificar y con los sensores +/- seleccionar el código correspondiente.",
            "8. Confirmar el código pulsando sobre el sensor del candado.",
            "9. Desconectar la cocina de red 10 segundos y volver a conectar."
        ],
        "sonidoOnOff": true,
        "limitadorPotencia": true,
        "modelosEjemplo": "IB 6009, IB 6030, IBR 641 VR01, IR 609 VR02, IR 630 VR02, IZ 7210"
    },
    {
        "id": "Tipo IV",
        "nombre": "Touch Control Tipo IV",
        "display": "Zonas 1 y 4",
        "sensores": "5 pulsaciones con slider",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos",
        "pasos": [
            "1. Desconectar la encimera de red y esperar 10 segundos.",
            "2. Reconectar a tensión de red.",
            "3. Dentro de los primeros 60 seg, realizar la secuencia de 5 pulsaciones en menos de 5 seg.",
            "4. Si es correcto, los displays de las zonas 1 y 4 entrarán en modo de configuración.",
            "5. Pulsar el sensor del candado.",
            "6. Seleccionar la zona del dígito y deslizar el slider táctil hasta el código de configuración deseado.",
            "7. Confirmar pulsando el sensor del candado.",
            "8. Desconectar de la red eléctrica 10 seg y volver a conectar."
        ],
        "sonidoOnOff": false,
        "limitadorPotencia": false,
        "modelosEjemplo": "IBS 641, IP 631, IPF 641, IR 631 VR02, IRF 3200, IRF 641, ITS 631"
    },
    {
        "id": "Tipo V",
        "nombre": "Touch Control Tipo V",
        "display": "Zonas 1 y 4",
        "sensores": "5 pulsaciones (con Auto-reconfiguración)",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos",
        "pasos": [
            "NOTA SW 4.0+: Desde versión SW 4.0 se reconfigura automáticamente al restituir energía si el código del TC coincide. Si se sustituyó el componente y muestra F47 en todas las zonas, es normal: se debe configurar el código correcto con el siguiente procedimiento:",
            "1. Desconectar la encimera de red 10 segundos y volver a conectar.",
            "2. Durante los 60 seg iniciales, realizar la secuencia de 5 toques en max 5 segundos.",
            "3. Se mostrará el código en los displays 1 y 4.",
            "4. Pulsar el sensor del candado.",
            "5. Seleccionar los dígitos con los controles táctiles hasta coincidir con la tabla de modelos.",
            "6. Confirmar pulsando el sensor del candado.",
            "7. Desconectar 10 segundos y volver a conectar."
        ],
        "sonidoOnOff": true,
        "limitadorPotencia": true,
        "modelosEjemplo": "IB 6415, IBC 63001 TCS, IR 6320, IRC 6320, IT 6320, IZ 6420 LB/SM/ST, IZF 6420"
    },
    {
        "id": "Tipo VI",
        "nombre": "Touch Control Tipo VI (Dómino)",
        "display": "Zonas 1 y 2",
        "sensores": "4 pulsaciones (Dómino 2 zonas)",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos",
        "pasos": [
            "1. Desconectar de la red 10 segundos y reconectar.",
            "2. Dentro de los 60 segundos, pulsar la secuencia de 4 sensores en menos de 5 seg.",
            "3. Si es correcto, parpadeará un punto en el display 1 y se mostrará el menú en displays 1 y 2.",
            "4. Pulsar el sensor del candado.",
            "5. Seleccionar con los sensores +/- el código de configuración de la tabla.",
            "6. Confirmar con el sensor del candado.",
            "7. Desconectar de la red 10 segundos y reconectar."
        ],
        "sonidoOnOff": true,
        "limitadorPotencia": true,
        "modelosEjemplo": "IB 3200, IB 3200 VR01, IB 321"
    },
    {
        "id": "Tipo VII",
        "nombre": "Touch Control Tipo VII (Pantalla TFT)",
        "display": "Pantalla TFT a color",
        "sensores": "Pulsación simultánea en esquinas",
        "ventana": "Durante segundo logo Teka en pantalla",
        "tiempoPulsacion": "3 segundos sostenidos",
        "pasos": [
            "1. Desconectar la encimera de la red eléctrica y esperar 10 segundos.",
            "2. Volver a conectar a la red. Tocar el sensor On/Off externo; el logo Teka aparecerá dos veces sobre el fondo negro.",
            "3. Cuando el logo de Teka aparezca por SEGUNDA vez, tocar simultáneamente las esquinas superiores de la pantalla táctil durante 3 segundos.",
            "4. El sistema entrará al Menú de Configuración de Servicio TFT.",
            "5. Navegar por la pantalla táctil para seleccionar el modelo y código de configuración correspondiente.",
            "6. Guardar cambios y reiniciar la cocina desconectando 10 segundos."
        ],
        "sonidoOnOff": true,
        "limitadorPotencia": true,
        "modelosEjemplo": "IRF 9480 TFT, IRF 9480 TFT (EC)"
    },
    {
        "id": "Tipo VIII",
        "nombre": "Touch Control Tipo VIII (iKnob con Mando Giratorio)",
        "display": "Zonas 1 y 4 + Aro LED iKnob",
        "sensores": "5 pulsaciones + Giro de mando iKnob",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos",
        "pasos": [
            "1. Desconectar la encimera de red 10 segundos y volver a conectar.",
            "2. Dentro de los primeros 60 segundos, realizar la secuencia de 5 pulsaciones.",
            "3. Se mostrará el menú de configuración en los displays 1 y 4.",
            "4. Pulsar el sensor del candado.",
            "5. Girar la perilla magnética iKnob hasta que en los displays se visualice el código requerido.",
            "6. Confirmar el código pulsando sobre el sensor del candado.",
            "7. Desconectar de la red eléctrica 10 segundos y volver a conectar."
        ],
        "sonidoOnOff": true,
        "limitadorPotencia": true,
        "modelosEjemplo": "IT 6350 IKNOB, IT 6450 IKNOB, IT 6450 IKNOB (EC)"
    },
    {
        "id": "Tipo IX",
        "nombre": "Touch Control Tipo IX",
        "display": "Displays numéricos individuales",
        "sensores": "5 pulsaciones + botones de subida/bajada",
        "ventana": "60 segundos tras conectar a red",
        "tiempoPulsacion": "Máximo 5 segundos",
        "pasos": [
            "1. Desconectar la encimera de red 10 segundos y reconectar.",
            "2. Realizar la secuencia de 5 pulsaciones dentro de los primeros 60 segundos.",
            "3. La confirmación e ingreso se realiza con el sensor 4.",
            "4. Los valores de los dígitos se modifican mediante los sensores 1 (baja) y 2 (sube).",
            "5. El cambio entre el display izquierdo y derecho se realiza mediante el sensor 3.",
            "6. Una vez colocado el código exacto, confirmar con el sensor 4.",
            "7. Desconectar la encimera 10 segundos y volver a conectar."
        ],
        "sonidoOnOff": true,
        "limitadorPotencia": true,
        "modelosEjemplo": "IBC 63002 TTC, IBC 63010 MSS, IBC 63900 TTC, IBC 64000 TTC, IBW 64010 TTC"
    }
];

window.TEKA_INDUCTION_MODULES = [
    {
        "generacion": "G0",
        "nombre": "Módulo de Inducción G0",
        "descripcion": "Primera arquitectura de módulos compactos. Cuenta con ventilador de refrigeración inferior, circuito de alimentación con filtro EMI integrado y generador de inductores.",
        "caracteristicas": "Placas de 3 y 4 fuegos serie IB/IR básica. Utiliza touch controls Tipo III, Tipo V y Tipo IX."
    },
    {
        "generacion": "G1 / G1+",
        "nombre": "Módulo de Inducción G1 y G1+ / Dómino",
        "descripcion": "Módulos de alta eficiencia con generadores duales. La versión G1+ incorpora microcontroladores optimizados y arquitectura Dómino de 2 zonas.",
        "caracteristicas": "Serie EKI, IB 641, IR 631, IRF 3200. Utiliza touch controls Tipo I, Tipo III, Tipo IV y Tipo VI."
    },
    {
        "generacion": "G2",
        "nombre": "Módulo de Inducción G2 (Generación 2)",
        "descripcion": "Generación con tecnología de modulación avanzada, drivers IGBT de respuesta rápida, soporte de mandos magnéticos iKnob y pantallas TFT.",
        "caracteristicas": "Serie IZ, IZF, IT 6320, IT 6450 iKnob, IRF 9480 TFT. Utiliza touch controls Tipo I, Tipo V, Tipo VII y Tipo VIII."
    },
    {
        "generacion": "G3",
        "nombre": "Módulo de Inducción G3 (Generación 3)",
        "descripcion": "Plataforma tope de gama con soporte para inducción total flex, zonas gigantes de 320mm y comunicación inteligente de alta velocidad.",
        "caracteristicas": "Serie IB 9530, IR 9530, IRS 953 (Ecuador), IRX 633, IRC 9430 KS. Utiliza principalmente touch control Tipo II."
    }
];
