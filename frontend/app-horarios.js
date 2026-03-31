const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const email = localStorage.getItem('userEmail');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarHorarios() {
    const rol = window.userRole;
    const grid = document.getElementById('horarios-grid');
    
    // 1. Mostrar controles si es Admin
    if (rol !== 'ROLE_ALUMNO') {
        document.getElementById('admin-controls').classList.remove('d-none');
        cargarSedesParaSelect();
    }

    // 2. Definir endpoint según rol
    const url = (rol === 'ROLE_ALUMNO') 
        ? `${API_BASE_URL}/api/training/mis-horarios?email=${email}`
        : `${API_BASE_URL}/api/training/todos`;

    try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        grid.innerHTML = '';

        if (data.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted">No hay clases programadas para esta semana.</div>';
            return;
        }

        data.forEach(h => {
            grid.innerHTML += `
                <div class="col-md-4">
                    <div class="card-tkd p-4 border-bottom border-orange border-4 h-100">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-orange fw-bold text-uppercase">${h.dia}</span>
                            ${rol !== 'ROLE_ALUMNO' ? `<button class="btn btn-sm text-danger" onclick="borrarHorario(${h.idHorario})"><i class="bi bi-trash"></i></button>` : ''}
                        </div>
                        <h3 class="fw-bold text-white">${h.horaInicio}</h3>
                        <p class="mb-0 small text-muted"><i class="bi bi-geo-alt"></i> Sede: ${h.sedeNombre}</p>
                        <p class="mb-0 small text-muted"><i class="bi bi-person"></i> Profe: ${h.profesorNombre || 'Por asignar'}</p>
                        ${rol === 'ROLE_ALUMNO' ? `<button class="btn btn-outline-success btn-sm w-100 mt-3" onclick="confirmarAsistenciaHoy(${h.idHorario})">Confirmar Mi Asistencia</button>` : ''}
                    </div>
                </div>`;
        });
    } catch (e) { grid.innerHTML = "Error al cargar el cronograma."; }
}

async function cargarSedesParaSelect() {
    const select = document.getElementById('h-sede');
    const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers });
    const sedes = await res.json();
    select.innerHTML = sedes.map(s => `<option value="${s.idSede}">${s.nombre}</option>`).join('');
}

async function crearClase() {
    const nuevaClase = {
        idSede: document.getElementById('h-sede').value,
        dia: document.getElementById('h-dia').value,
        horaInicio: document.getElementById('h-hora').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/training/horarios`, {
            method: 'POST', headers, body: JSON.stringify(nuevaClase)
        });
        if (res.ok) {
            alert("✅ Horario publicado en la nube.");
            cargarHorarios();
        }
    } catch (e) { alert("Error al asignar clase."); }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inyectar links de admin en el sidebar
    if (window.userRole !== 'ROLE_ALUMNO') {
        const nav = document.getElementById('nav-container');
        nav.innerHTML = `
            <a class="nav-link" href="dashboard.html"><i class="bi bi-speedometer2"></i> Inicio</a>
            <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
            <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
            ${nav.innerHTML}
        `;
    }
    cargarHorarios();
});