const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const email = localStorage.getItem('userEmail');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

// Función auxiliar para limpiar datos nulos o vacíos
const validarDato = (valor, reemplazo = 'PENDIENTE') => {
    return (valor && valor !== "null" && valor !== "undefined" && valor.toString().trim() !== "") 
        ? valor 
        : `<span class="text-warning opacity-50">${reemplazo}</span>`;
};

async function cargarPerfil() {
    const grid = document.getElementById('perfil-grid');
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers });
        if (res.ok) {
            const u = await res.json();
            
            // Actualizar Cabecera
            document.getElementById('p-full-name').innerText = `${u.nombre} ${u.apellido || ''}`;
            document.getElementById('p-foto').src = `https://ui-avatars.com/api/?name=${u.nombre}+${u.apellido || ''}&background=random`;
            
            // Determinar Rol (Prioridad al objeto usuario de la DB, luego al token)
            const rolFinal = u.rol || window.userRole || 'ROLE_ALUMNO';
            const rolLimpio = rolFinal.replace('ROLE_', '');
            document.getElementById('p-badge-rol').innerText = `RANGO: ${rolLimpio}`;

            // Dibujar Cuadrícula de Datos con validación anti-nulos
            grid.innerHTML = `
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DOCUMENTO DE IDENTIDAD (DNI)</p>
                    <p class="fw-bold text-white fs-5">${validarDato(u.dni, 'DNI NO REGISTRADO')}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">CORREO ELECTRÓNICO</p>
                    <p class="fw-bold text-white fs-5">${u.email}</p>
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

            // Pre-llenar campos de edición
            document.getElementById('edit-tel').value = u.telefono || '';
            document.getElementById('edit-dir').value = u.direccion || '';
        }
    } catch (e) { 
        grid.innerHTML = `<div class="alert alert-danger">Error de conexión con la base de datos Neon.</div>`; 
    }
}

async function actualizarDatos() {
    const tel = document.getElementById('edit-tel').value.trim();
    const dir = document.getElementById('edit-dir').value.trim();

    if (!tel || !dir) {
        alert("⚠️ Por favor, completa tu teléfono y dirección.");
        return;
    }

    const datos = { email, telefono: tel, direccion: dir };

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT', headers, body: JSON.stringify(datos)
        });
        
        if (res.ok) {
            alert("✅ ¡Información sincronizada correctamente!");
            cargarPerfil(); 
        }
    } catch (e) { alert("Error al conectar con el Gateway."); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // 🛡️ LÓGICA DE INYECCIÓN DE PESTAÑAS SEGÚN RANGO
    const currentRole = window.userRole || 'ROLE_ALUMNO';
    const navAdmin = document.getElementById('nav-admin-extras');

    if (navAdmin) {
        if (currentRole.includes('ADMIN')) {
            // EL ADMIN VE TODO
            navAdmin.innerHTML = `
                <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
                <a class="nav-link" href="usuarios.html"><i class="bi bi-shield-lock"></i> Usuarios y Roles</a>
                <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
            `;
        } else if (currentRole.includes('PROFESOR')) {
            // EL PROFESOR SOLO VE ALUMNOS Y SEDES
            navAdmin.innerHTML = `
                <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
                <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
            `;
        }
    }
    
    cargarPerfil();
});