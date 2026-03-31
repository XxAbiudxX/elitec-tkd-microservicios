const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const email = localStorage.getItem('userEmail');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

// Función auxiliar mejorada: Detecta "null" como string (común en respuestas JSON mal mapeadas)
const validarDato = (valor, reemplazo = 'PENDIENTE') => {
    const esInvalido = !valor || valor === "null" || valor === "undefined" || valor.toString().trim() === "";
    return esInvalido ? `<span class="text-warning opacity-50">${reemplazo}</span>` : valor;
};

// --- 🛡️ EXTRACCIÓN DE SEGURIDAD ---
// Si window.userRole falla, lo extraemos manualmente del token aquí mismo
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
        const u = await res.json();

        if (res.ok) {
            // Evitamos el "null" en el nombre usando el email como respaldo
            const nombreFinal = (u.nombre && u.nombre !== "null") ? u.nombre : email.split('@')[0];
            const apellidoFinal = (u.apellido && u.apellido !== "null") ? u.apellido : "";
            
            document.getElementById('p-full-name').innerText = `${nombreFinal} ${apellidoFinal}`;
            document.getElementById('p-foto').src = `https://ui-avatars.com/api/?name=${nombreFinal}+${apellidoFinal}&background=random`;
            
            // Forzamos la limpieza del Rango
            const rolActual = obtenerRolSeguro();
            const rolLimpio = rolActual.replace('ROLE_', '').replace('[', '').replace(']', '');
            document.getElementById('p-badge-rol').innerText = `RANGO: ${rolLimpio}`;

            grid.innerHTML = `
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DOCUMENTO DE IDENTIDAD (DNI)</p>
                    <p class="fw-bold text-white fs-5">${validarDato(u.dni, 'DNI NO REGISTRADO')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">CORREO ELECTRÓNICO</p>
                    <p class="fw-bold text-white fs-5">${u.email || email}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DIRECCIÓN DE RESIDENCIA</p>
                    <p class="fw-bold text-white fs-5 text-uppercase">${validarDato(u.direccion, 'DIRECCIÓN PENDIENTE')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">ESTADO EN EL DOJO</p>
                    <p class="fw-bold text-success fs-5">● ACTIVO / VALIDADO</p>
                </div>
            `;

            document.getElementById('edit-tel').value = (u.telefono && u.telefono !== "null") ? u.telefono : '';
            document.getElementById('edit-dir').value = (u.direccion && u.direccion !== "null") ? u.direccion : '';
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

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT', 
            headers, 
            body: JSON.stringify({ email, telefono: tel, direccion: dir })
        });
        
        if (res.ok) {
            alert("✅ Sincronizado con éxito.");
            cargarPerfil(); 
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
        // Usamos una búsqueda más flexible para el rol
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