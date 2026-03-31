const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const email = localStorage.getItem('userEmail');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

// Variable global para almacenar todos tus datos y no perderlos al actualizar
let usuarioActualCompleto = {}; 

const validarDato = (valor, reemplazo = 'PENDIENTE') => {
    const esInvalido = !valor || valor === "null" || valor === "undefined" || valor.toString().trim() === "";
    return esInvalido ? `<span class="text-warning opacity-50">${reemplazo}</span>` : valor;
};

function obtenerRolSeguro() {
    try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        return payload.role || payload.authorities || payload.roles || 'ROLE_ALUMNO';
    } catch (e) {
        return 'ROLE_ALUMNO';
    }
}

async function cargarPerfil() {
    const grid = document.getElementById('perfil-grid');
    if (!email) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers });
        
        if (res.ok) {
            // Guardamos el registro íntegro de la base de datos
            usuarioActualCompleto = await res.json(); 
            
            // Renderizado seguro
            const nombreFinal = (usuarioActualCompleto.nombre && usuarioActualCompleto.nombre !== "null") ? usuarioActualCompleto.nombre : "";
            const apellidoFinal = (usuarioActualCompleto.apellido && usuarioActualCompleto.apellido !== "null") ? usuarioActualCompleto.apellido : "";
            const nombreMostrar = (nombreFinal || apellidoFinal) ? `${nombreFinal} ${apellidoFinal}`.trim() : email.split('@')[0];
            
            document.getElementById('p-full-name').innerText = nombreMostrar;
            document.getElementById('p-foto').src = `https://ui-avatars.com/api/?name=${nombreMostrar}&background=random`;
            
            const rolActual = obtenerRolSeguro();
            const rolLimpio = rolActual.replace('ROLE_', '').replace('[', '').replace(']', '');
            document.getElementById('p-badge-rol').innerText = `RANGO: ${rolLimpio}`;

            grid.innerHTML = `
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DOCUMENTO DE IDENTIDAD (DNI)</p>
                    <p class="fw-bold text-white fs-5">${validarDato(usuarioActualCompleto.dni, 'DNI NO REGISTRADO')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">CORREO ELECTRÓNICO</p>
                    <p class="fw-bold text-white fs-5">${usuarioActualCompleto.email || email}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DIRECCIÓN DE RESIDENCIA</p>
                    <p class="fw-bold text-white fs-5 text-uppercase">${validarDato(usuarioActualCompleto.direccion, 'DIRECCIÓN PENDIENTE')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">ESTADO EN EL DOJO</p>
                    <p class="fw-bold text-success fs-5">● ACTIVO / VALIDADO</p>
                </div>
            `;

            document.getElementById('edit-tel').value = (usuarioActualCompleto.telefono && usuarioActualCompleto.telefono !== "null") ? usuarioActualCompleto.telefono : '';
            document.getElementById('edit-dir').value = (usuarioActualCompleto.direccion && usuarioActualCompleto.direccion !== "null") ? usuarioActualCompleto.direccion : '';
        }
    } catch (e) { 
        grid.innerHTML = `<div class="alert alert-danger">Error de comunicación con el microservicio.</div>`; 
    }
}

async function actualizarDatos() {
    const tel = document.getElementById('edit-tel').value.trim();
    const dir = document.getElementById('edit-dir').value.trim();

    if (!tel || !dir) {
        alert("⚠️ Por favor, completa los campos.");
        return;
    }

    // MODIFICACIÓN CLAVE: Actualizamos SOLO lo que editaste en la copia del objeto completo
    usuarioActualCompleto.telefono = tel;
    usuarioActualCompleto.direccion = dir;

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT', 
            headers, 
            body: JSON.stringify(usuarioActualCompleto) // Mandamos TODA la ficha de vuelta
        });
        
        if (res.ok) {
            alert("✅ Datos actualizados sin borrar el resto de tu ficha.");
            cargarPerfil(); 
        } else {
            alert("Error al guardar en el servidor.");
        }
    } catch (e) { alert("Error al conectar."); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const currentRole = obtenerRolSeguro();
    const navAdmin = document.getElementById('nav-admin-extras');

    if (navAdmin) {
        if (currentRole.includes('ADMIN')) {
            navAdmin.innerHTML = `
                <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
                <a class="nav-link" href="usuarios.html"><i class="bi bi-shield-lock"></i> Usuarios y Roles</a>
                <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
            `;
        } else if (currentRole.includes('PROFESOR')) {
            navAdmin.innerHTML = `
                <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
                <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
            `;
        }
    }
    cargarPerfil();
});