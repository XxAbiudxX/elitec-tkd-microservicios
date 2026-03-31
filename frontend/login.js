// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";

// --- 🥋 SEGURIDAD PREVENTIVA ---
// Si ya hay un token válido, mandamos al Sensei directo al Dashboard
if (localStorage.getItem('jwtToken')) {
    window.location.href = 'index.html';
}

// --- 🛠️ UTILIDAD PARA MENSAJES DE ERROR ---
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.innerText = mensaje;
        errorDiv.classList.remove('d-none');
    } else {
        alert(mensaje);
    }
}

// --- 🚪 FUNCIÓN: INICIAR SESIÓN ---
const formLogin = document.getElementById('loginForm');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const emailInput = document.getElementById('email').value;
        const passwordInput = document.getElementById('password').value;
        
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Conectando...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    password: passwordInput
                })
            });

            if (res.ok) {
                const data = await res.json();
                
                // Guardamos la "Llave Maestra" y el email para personalizar el Dashboard
                localStorage.setItem('jwtToken', data.token); 
                localStorage.setItem('userEmail', emailInput);
                
                window.location.href = 'index.html'; 
            } else {
                mostrarError("Credenciales incorrectas. Verifica tu email y contraseña.");
            }
        } catch (error) {
            mostrarError("Error de red: No se pudo conectar con el Gateway en Railway.");
        } finally {
            btn.innerHTML = 'ENTRAR AL DOJO';
            btn.disabled = false;
        }
    });
}

// --- 🥋 FUNCIÓN: REGISTRAR NUEVO SENSEI ---
const formRegistro = document.getElementById('registerForm');
if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creando...';
        btn.disabled = true;

        const nuevoUsuario = {
            nombre: document.getElementById('reg-nombre').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            rol: "ADMIN" // Por defecto registramos como administradores del sistema
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });

            if (res.ok) {
                alert("🥋 ¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
                // Si usas la función toggleAuth() definida en el HTML anterior:
                if (typeof toggleAuth === 'function') {
                    toggleAuth();
                } else {
                    location.reload(); // Recarga si no encuentra la función
                }
            } else {
                const errorMsg = await res.text();
                mostrarError("Error: " + errorMsg);
            }
        } catch (error) {
            mostrarError("Error de conexión: El servidor en la nube no responde.");
        } finally {
            btn.innerHTML = 'CREAR CUENTA SENSEI';
            btn.disabled = false;
        }
    });
}

// --- 🔄 LÓGICA DE INTERFAZ (TOGGLE) ---
// Esta función permite cambiar entre Login y Registro en la misma tarjeta
function toggleAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const toggleText = document.getElementById('toggle-text');

    if (loginForm.classList.contains('hidden')) {
        // Volver a Login
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        title.innerText = "Elitec TKD";
        subtitle.innerText = "Ingresa al Dojo";
        toggleText.innerHTML = '¿Eres nuevo Sensei? <span class="toggle-link" onclick="toggleAuth()">Regístrate</span>';
    } else {
        // Ir a Registro
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        title.innerText = "Nuevo Sensei";
        subtitle.innerText = "Crea tu cuenta de acceso";
        toggleText.innerHTML = '¿Ya tienes cuenta? <span class="toggle-link" onclick="toggleAuth()">Inicia Sesión</span>';
    }
}