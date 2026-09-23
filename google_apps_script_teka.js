/**
 * ============================================================================
 * CONECTOR GMAIL PARA FIX GESTIÓN - ENVÍO OFICIAL DE GARANTÍAS TEKA
 * ============================================================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN (Solo se realiza una vez, toma 2 minutos):
 * 
 * 1. Abre tu navegador e inicia sesión con: criscapelo.fix@gmail.com
 * 2. Entra a: https://script.google.com/home/start
 * 3. Haz clic en el botón azul "+ Nuevo proyecto".
 * 4. Borra cualquier código que aparezca en el editor y pega TODO este archivo.
 * 5. Haz clic en "Guardar" (icono de disquete 💾). Ponle de nombre: "Conector Gmail FIX".
 * 6. En la esquina superior derecha, haz clic en el botón azul "Implementar" (Deploy)
 *    y selecciona "Nueva implementación" (New deployment).
 * 7. En el icono de engranaje ⚙️ a la izquierda de "Seleccionar tipo", elige: "Aplicación web".
 * 8. Configura estos campos:
 *    - Descripción: Conector Gmail Teka FIX
 *    - Ejecutar como: "Yo (criscapelo.fix@gmail.com)"  <-- MUY IMPORTANTE
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) <-- MUY IMPORTANTE
 * 9. Haz clic en "Implementar". Google te pedirá "Revisar permisos" (Authorize access):
 *    - Selecciona tu cuenta criscapelo.fix@gmail.com
 *    - Si Google muestra "Google no ha verificado esta app", haz clic en "Avanzado" (Advanced)
 *      y luego abajo en "Ir a Conector Gmail FIX (no seguro)"
 *    - Haz clic en "Permitir" (Allow).
 * 10. Copia la "URL de la aplicación web" que termina en "/exec"
 *     (Ejemplo: https://script.google.com/macros/s/AKfycb.../exec)
 * 11. Pega esa URL en el sistema FIX Gestión en la ventana de Garantías y haz clic en "Guardar".
 * 
 * ¡Listo! A partir de ese momento, cada vez que envíes una garantía, FIX Gestión
 * enviará el correo a mnavarrete@teka.ec directamente desde criscapelo.fix@gmail.com
 * con los 4 archivos adjuntos de forma 100% automática.
 */

function doPost(e) {
  try {
    var rawContents = e.postData ? e.postData.contents : "";
    if (!rawContents) {
      return jsonResponse({ status: "error", message: "No se recibieron datos en el cuerpo de la petición." });
    }
    
    var data = JSON.parse(rawContents);
    var to = data.to || "mnavarrete@teka.ec";
    var subject = data.subject || "SOLICITUD DE GARANTIA TEKA";
    var body = data.body || ""; // Cuerpo vacío según regla de fábrica TEKA
    var mode = data.mode || "send"; // "send" para enviar directo, "draft" para borrador
    
    var attachments = [];
    if (data.files && data.files.length) {
      for (var i = 0; i < data.files.length; i++) {
        var file = data.files[i];
        if (file && file.base64 && file.name) {
          var cleanBase64 = file.base64.indexOf(',') > -1 
            ? file.base64.split(',')[1] 
            : file.base64;
          var bytes = Utilities.base64Decode(cleanBase64);
          var mimeType = file.type || "application/octet-stream";
          var blob = Utilities.newBlob(bytes, mimeType, file.name);
          attachments.push(blob);
        }
      }
    }
    
    if (mode === "draft") {
      var draft = GmailApp.createDraft(to, subject, body, {
        attachments: attachments
      });
      return jsonResponse({
        status: "success",
        mode: "draft",
        message: "Borrador creado exitosamente en Gmail con " + attachments.length + " archivos adjuntos.",
        draftId: draft.getId()
      });
    } else {
      GmailApp.sendEmail(to, subject, body, {
        attachments: attachments
      });
      return jsonResponse({
        status: "success",
        mode: "sent",
        message: "Correo enviado exitosamente a " + to + " con " + attachments.length + " archivos adjuntos."
      });
    }
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

function doGet(e) {
  var activeUser = "";
  try {
    activeUser = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  } catch (err) {
    activeUser = "criscapelo.fix@gmail.com";
  }
  return jsonResponse({
    status: "ok",
    service: "FIX Gestión - Conector Gmail TEKA",
    user: activeUser,
    timestamp: new Date().toISOString()
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
