const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const email = localStorage.getItem('userEmail');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarPerfil() {
    const grid = document.getElementById('perfil-grid');
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers });
        if (res.ok) {
            const u = await res.json();
            
            // Actualizar Cabecera
            document.getElementById('p-full-name').innerText = `${u.nombre} ${u.apellido}`;
            document.getElementById('p-foto').src = `https://ui-avatars.com/api/?name=${u.nombre}+${u.apellido}&background=random`;
            
            // Determinar Rol para el Badge
            const rol = window.userRole.replace('ROLE_', '');
            document.getElementById('p-badge-rol').innerText = `RANGO: ${rol}`;

            // Dibujar Cuadrícula de Datos
            grid.innerHTML = `
                <div class="col-md-6">
                    <p class="text-muted small mb-0">DOCUMENTO DE IDENTIDAD (DNI)</p>
                    <p class="fw-bold text-white fs-5">${u.dni || 'PENDIENTE DE REGISTRO'}</p>
                </div>
                <div class="col-md-6">
                    <p class="text-muted small mb-0">CORREO ELECTRÓNICO</p>
                    <p class="fw-bold text-white fs-5">${u.email}</p>
                </div>
                <div class="col-md-6">
                    <p class="text-muted small mb-0">DIRECCIÓN DE RESIDENCIA</p>
                    <p class="fw-bold text-white fs-5">${u.direccion || 'No especificada'}</p>
                </div>
                <div class="col-md-6">
                    <p class="text-muted small mb-0">ESTADO EN EL DOJO</p>
                    <p class="fw-bold text-success fs-5">● ACTIVO</p>
                </div>
            `;

            // Pre-llenar campos de edición
            document.getElementById('edit-tel').value = u.telefono || '';
            document.getElementById('edit-dir').value = u.direccion || '';
        }
    } catch (e) { grid.innerHTML = "Error al conectar con el servicio de autenticación."; }
}

async function actualizarDatos() {
    const datos = {
        email: email,
        telefono: document.getElementById('edit-tel').value,
        direccion: document.getElementById('edit-dir').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT', headers, body: JSON.stringify(datos)
        });
        if (res.ok) {
            alert("✅ Información actualizada correctamente.");
            cargarPerfil(); // Recargar datos
        }
    } catch (e) { alert("Error al actualizar perfil."); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // Si es ADMIN, mostrar links de gestión en el sidebar (opcional)
    if (window.userRole !== 'ROLE_ALUMNO') {
        document.getElementById('nav-admin-extras').innerHTML = `
            <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
            <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
        `;
    }
    cargarPerfil();
});