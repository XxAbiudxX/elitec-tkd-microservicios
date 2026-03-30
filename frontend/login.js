// --- INICIAR SESIÓN ---
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnLogin');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Conectando...';
    btn.disabled = true;

    try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('jwtToken', data.token); // Guardamos el Pase VIP
            window.location.href = 'index.html'; // Redirigimos al Dashboard
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('loginError').innerText = "El servidor Gateway está apagado.";
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
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        rol: "ADMIN" // Por defecto le damos rol de admin
    };

    try {
        // Asumiendo que crearás un endpoint /register en tu auth-service
        const res = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario)
        });

        if (res.ok) {
            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            document.getElementById('login-tab').click(); // Volvemos a la pestaña de login
            document.getElementById('formRegistro').reset();
        } else {
            alert("No se pudo crear la cuenta. Verifica que el backend tenga el endpoint /register.");
        }
    } catch (error) {
        alert("Error de conexión con el servidor.");
    } finally {
        btn.innerHTML = 'Registrar Administrador';
        btn.disabled = false;
    }
});