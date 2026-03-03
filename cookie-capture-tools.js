/**
 * BOOKMARKLET PARA CAPTURAR COOKIE DEL SIGE
 *
 * Cómo usar:
 * 1. Crea un nuevo marcador/favorito en tu navegador
 * 2. Copia todo el código de abajo en el campo URL
 * 3. Inicia sesión en http://sige.utsh.edu.mx/estudiantes/
 * 4. Haz clic en el marcador
 * 5. La cookie se copiará automáticamente al portapapeles
 *
 * IMPORTANTE: Este código debe ejecutarse SOLO en el dominio del SIGE
 */

// ===== VERSIÓN 1: BOOKMARKLET (Una sola línea) =====
// Copia esta línea completa y pégala como URL del marcador:

javascript: (function () {
  const c = document.cookie.match(/PHPSESSID=([^;]+)/);
  if (c) {
    navigator.clipboard
      .writeText(c[1])
      .then(() =>
        alert(
          "✅ Cookie PHPSESSID copiada!\n\n" +
            c[1] +
            "\n\nAhora ve a la página de sincronización y pégala.",
        ),
      );
    document.body.innerHTML =
      '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);color:white;display:flex;align-items:center;justify-content:center;font-family:monospace;flex-direction:column;z-index:999999"><h1>🍪 Cookie Capturada</h1><p style="font-size:24px;background:#333;padding:20px;border-radius:10px;margin:20px">' +
      c[1] +
      '</p><p>Copiado al portapapeles</p><button onclick="window.close()" style="margin-top:20px;padding:10px 30px;font-size:18px;background:#4CAF50;color:white;border:none;border-radius:5px;cursor:pointer">Cerrar</button></div>';
  } else {
    alert(
      "❌ No se encontró cookie PHPSESSID.\n\nAsegúrate de:\n1. Estar en sige.utsh.edu.mx\n2. Haber iniciado sesión",
    );
  }
})();

// ===== VERSIÓN 2: SCRIPT PARA CONSOLA (F12) =====
// Si no quieres usar bookmarklet, abre la consola (F12) en el SIGE y pega esto:

(function () {
  // Obtener la cookie PHPSESSID
  const cookieMatch = document.cookie.match(/PHPSESSID=([^;]+)/);

  if (!cookieMatch) {
    console.error("❌ No se encontró cookie PHPSESSID");
    console.log("Asegúrate de:");
    console.log("1. Estar en http://sige.utsh.edu.mx/estudiantes/");
    console.log("2. Haber iniciado sesión");
    return;
  }

  const phpsessid = cookieMatch[1];

  // Copiar al portapapeles
  navigator.clipboard
    .writeText(phpsessid)
    .then(() => {
      console.log("✅ Cookie PHPSESSID copiada al portapapeles!");
      console.log("");
      console.log("📋 Cookie:", phpsessid);
      console.log("");
      console.log("👉 Siguiente paso:");
      console.log("   1. Ve a tu plataforma de sincronización");
      console.log("   2. Pega la cookie donde se indique");
      console.log('   3. Haz clic en "Sincronizar"');
    })
    .catch(() => {
      console.warn("⚠️ No se pudo copiar automáticamente");
      console.log("");
      console.log("📋 Copia manualmente esta cookie:");
      console.log(
        "%c" + phpsessid,
        "font-size: 16px; background: yellow; color: black; padding: 5px",
      );
    });

  // Crear overlay visual
  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideIn 0.3s ease-out;
    ">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">
        🍪 Cookie Capturada
      </h3>
      <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 0.9;">
        PHPSESSID copiado al portapapeles
      </p>
      <code style="
        display: block;
        background: rgba(255,255,255,0.1);
        padding: 10px;
        border-radius: 5px;
        font-size: 11px;
        word-break: break-all;
        margin-bottom: 15px;
      ">${phpsessid}</code>
      <button onclick="this.parentElement.parentElement.remove()" style="
        width: 100%;
        padding: 10px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
      ">
        Cerrar
      </button>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(overlay);

  // Auto-cerrar después de 10 segundos
  setTimeout(() => {
    overlay.remove();
  }, 10000);
})();

// ===== VERSIÓN 3: EXTENSION DE CHROME (manifest.json) =====
/*
Crea una extensión simple de Chrome para capturar cookies automáticamente:

1. Crea una carpeta llamada "sige-cookie-capturer"

2. Crea manifest.json:
{
  "manifest_version": 3,
  "name": "SIGE Cookie Capturer",
  "version": "1.0",
  "description": "Captura la cookie PHPSESSID del portal SIGE",
  "permissions": ["cookies", "activeTab"],
  "host_permissions": ["http://sige.utsh.edu.mx/*"],
  "action": {
    "default_popup": "popup.html"
  }
}

3. Crea popup.html:
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 300px; padding: 20px; font-family: sans-serif; }
    button { width: 100%; padding: 10px; margin: 10px 0; cursor: pointer; }
    #cookie { background: #f0f0f0; padding: 10px; word-break: break-all; font-family: monospace; }
  </style>
</head>
<body>
  <h3>🍪 Capturador de Cookie SIGE</h3>
  <button id="capture">Capturar Cookie</button>
  <div id="result"></div>
  <script src="popup.js"></script>
</body>
</html>

4. Crea popup.js:
document.getElementById('capture').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  
  if (!tab.url.includes('sige.utsh.edu.mx')) {
    document.getElementById('result').innerHTML = 
      '<p style="color: red">❌ Debes estar en sige.utsh.edu.mx</p>';
    return;
  }
  
  const cookies = await chrome.cookies.getAll({ 
    url: 'http://sige.utsh.edu.mx' 
  });
  
  const phpsessid = cookies.find(c => c.name === 'PHPSESSID');
  
  if (phpsessid) {
    navigator.clipboard.writeText(phpsessid.value);
    document.getElementById('result').innerHTML = 
      '<p style="color: green">✅ Copiado!</p>' +
      '<div id="cookie">' + phpsessid.value + '</div>';
  } else {
    document.getElementById('result').innerHTML = 
      '<p style="color: red">❌ No encontrado. ¿Iniciaste sesión?</p>';
  }
});

5. Carga la extensión en Chrome:
   - Ve a chrome://extensions/
   - Activa "Modo de desarrollador"
   - Clic en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta "sige-cookie-capturer"
*/

// ===== VERSIÓN 4: USERSCRIPT (Tampermonkey/Greasemonkey) =====
/*
// ==UserScript==
// @name         SIGE Cookie Auto-Capturer
// @namespace    http://utsh.edu.mx/
// @version      1.0
// @description  Captura automáticamente la cookie del SIGE después del login
// @author       SIGE-PLUS Team
// @match        http://sige.utsh.edu.mx/estudiantes/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    
    // Esperar 2 segundos después de cargar la página
    setTimeout(() => {
        const cookieMatch = document.cookie.match(/PHPSESSID=([^;]+)/);
        
        if (cookieMatch && window.location.pathname !== '/estudiantes/index.php') {
            const phpsessid = cookieMatch[1];
            
            // Mostrar banner
            const banner = document.createElement('div');
            banner.style = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #4CAF50;
                color: white;
                padding: 15px;
                text-align: center;
                z-index: 999999;
                font-family: Arial;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            banner.innerHTML = `
                <strong>🍪 Cookie SIGE capturada</strong> 
                <button style="
                    margin-left: 20px;
                    padding: 5px 15px;
                    background: white;
                    color: #4CAF50;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-weight: bold;
                " onclick="this.parentElement.remove()">
                    ✓ OK
                </button>
                <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.9;">
                    PHPSESSID: ${phpsessid.substr(0, 20)}...
                </p>
            `;
            document.body.insertBefore(banner, document.body.firstChild);
            
            // Auto-cerrar después de 5 segundos
            setTimeout(() => banner.remove(), 5000);
            
            // Copiar al portapapeles
            if (typeof GM_setClipboard !== 'undefined') {
                GM_setClipboard(phpsessid);
            } else {
                navigator.clipboard.writeText(phpsessid);
            }
            
            // Opcional: Sincronizar automáticamente
            // if (confirm('¿Deseas sincronizar tus datos automáticamente?')) {
            //     window.open('http://localhost:4321/sige-login', '_blank');
            // }
        }
    }, 2000);
})();
*/
