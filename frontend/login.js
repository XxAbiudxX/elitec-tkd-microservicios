// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";

// --- INICIAR SESIÓN ---
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    const emailInput = document.getElementById('loginEmail').value; // Capturamos el email
    
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Conectando...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailInput,
                password: document.getElementById('loginPassword').value
            })
        });

        if (res.ok) {
            const data = await res.json();
            
            // --- 🥋 LA LLAVE MAESTRA ---
            localStorage.setItem('jwtToken', data.token); 
            localStorage.setItem('userEmail', emailInput); // Guardamos el email para el Dashboard
            
            window.location.href = 'index.html'; 
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('loginError').innerText = "Error de conexión con el Gateway en Railway.";
        document.getElementById('loginError').style.display = 'block';
    } finally {
        btn.innerHTML = 'Entrar al Dojo';
        btn.disabled = false;
    }
});

// --- CREAR CUENTA ---
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnRegister');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creando...';
    btn.disabled = true;

    const nuevoUsuario = {
        nombre: document.getElementById('regNombre').value,
        apellido: document.getElementById('regApellido').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        rol: "ADMIN"
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario)
        });

        if (res.ok) {
            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            document.getElementById('login-tab').click(); 
            document.getElementById('formRegistro').reset();
        } else {
            const errorMsg = await res.text();
            alert("Error: " + errorMsg);
        }
    } catch (error) {
        alert("Error de conexión con el servidor en la nube.");
    } finally {
        btn.innerHTML = 'Registrar Administrador';
        btn.disabled = false;
    }
});