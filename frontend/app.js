// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');

if (!token) window.location.href = 'login.html';

// --- 🔐 SEGURIDAD Y ROLES ---
function getRoleFromToken() {
    try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        // Buscamos en 'role', 'roles' o el claim estándar de Spring Security
        return payload.role || payload.roles || payload.authorities || 'ROLE_ALUMNO';
    } catch (e) { return 'ROLE_ALUMNO'; }
}

function getHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// --- 🚀 NAVEGACIÓN INTELIGENTE ---
function switchTab(sectionId, element) {
    const rol = getRoleFromToken();

    // Restricción de acceso para Alumnos
    const zonasAdmin = ['alumnos', 'profesores', 'sedes'];
    if (zonasAdmin.includes(sectionId) && rol === 'ROLE_ALUMNO') {
        alert("Acceso Restringido: Solo personal administrativo.");
        return;
    }

    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById('sec-' + sectionId).classList.add('active');
    element.classList.add('active');

    // Carga de datos según pestaña
    switch(sectionId) {
        case 'inicio': cargarEstadisticas(); break;
        case 'alumnos': cargarAlumnos(); break;
        case 'profesores': cargarProfesores(); break;
        case 'sedes': cargarSedes(); break;
        case 'horarios': cargarHorarios(); break;
        case 'perfil': cargarDatosPerfil(); break;
    }
}

// --- 📊 TABLERO INICIAL ---
async function cargarEstadisticas() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos/count`, { headers: getHeaders() });
        const count = await res.json();
        document.getElementById('count-alumnos').innerText = count;
    } catch (e) { console.error("Error en estadísticas"); }
}

// --- 👤 MI PERFIL (COMPLETAR DATOS) ---
async function cargarDatosPerfil() {
    const email = localStorage.getItem('userEmail');
    const grid = document.getElementById('perfil-data-grid');
    grid.innerHTML = '<div class="spinner-border text-danger"></div>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers: getHeaders() });
        if (res.ok) {
            const u = await res.json();
            document.getElementById('p-nombre-header').innerText = `${u.nombre} ${u.apellido}`;
            document.getElementById('p-rol-tag').innerText = getRoleFromToken().replace('ROLE_', '');
            
            grid.innerHTML = `
                <div class="col-md-6"><label class="text-muted small">DNI / IDENTIDAD</label><p class="fw-bold">${u.dni || 'PENDIENTE'}</p></div>
                <div class="col-md-6"><label class="text-muted small">CORREO</label><p class="fw-bold">${u.email}</p></div>
                <div class="col-md-6">
                    <label class="text-muted small">CELULAR</label>
                    <input type="text" id="edit-p-tel" class="form-control bg-secondary text-white border-0" value="${u.telefono || ''}">
                </div>
                <div class="col-md-6">
                    <label class="text-muted small">DIRECCIÓN</label>
                    <input type="text" id="edit-p-dir" class="form-control bg-secondary text-white border-0" value="${u.direccion || ''}">
                </div>
                <div class="col-12"><button class="btn btn-tkd w-auto mt-3" onclick="actualizarMiPerfil()">ACTUALIZAR MI FICHA</button></div>
            `;
        }
    } catch (e) { grid.innerHTML = "Error al conectar con Auth-Service"; }
}

async function actualizarMiPerfil() {
    const datos = {
        email: localStorage.getItem('userEmail'),
        telefono: document.getElementById('edit-p-tel').value,
        direccion: document.getElementById('edit-p-dir').value
    };
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(datos)
        });
        if (res.ok) alert("✅ Perfil actualizado en la nube.");
    } catch (e) { alert("Error de conexión"); }
}

// --- 🥋 GESTIÓN DE ALUMNOS ---
let alumnosCache = [];
async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="spinner-border text-warning"></div>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        alumnosCache = await res.json();
        renderizarListaAlumnos(alumnosCache);
    } catch (e) { div.innerHTML = "Error en Student-Service"; }
}

function filtrarAlumnos(busqueda) {
    const filtrados = alumnosCache.filter(a => 
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) || a.dni.includes(busqueda)
    );
    renderizarListaAlumnos(filtrados);
}

function renderizarListaAlumnos(lista) {
    const div = document.getElementById('students-list');
    div.innerHTML = '';
    lista.forEach((a, index) => {
        div.innerHTML += `
            <div class="col-md-4">
                <div class="card card-tkd h-100 shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <span class="badge bg-warning text-dark">ACTIVO</span>
                            <button class="btn btn-sm text-danger" onclick="eliminarAlumno(${a.idAlumno})"><i class="bi bi-trash"></i></button>
                        </div>
                        <h5 class="fw-bold mt-2 text-uppercase">${a.nombre} ${a.apellido}</h5>
                        <p class="small text-muted mb-0">DNI: ${a.dni}</p>
                        <p class="small text-white">Cinta: <span class="text-orange">${a.cintaActual}</span></p>
                        <button class="btn btn-tkd mt-2 btn-sm" onclick="verDetalleAlumno(${index})">VER FICHA COMPLETA</button>
                    </div>
                </div>
            </div>`;
    });
}

// --- 📅 MÓDULO DE HORARIOS (TRAINING-SERVICE) ---
async function cargarHorarios() {
    const rol = getRoleFromToken();
    const email = localStorage.getItem('userEmail');
    const div = document.getElementById('horarios-grid');
    div.innerHTML = '<div class="spinner-border text-light"></div>';

    // Si es ADMIN muestra panel de creación
    if(rol === 'ROLE_ADMIN') document.getElementById('admin-horario-panel').classList.remove('d-none');

    try {
        const url = rol === 'ROLE_ALUMNO' ? 
            `${API_BASE_URL}/api/training/mis-horarios?email=${email}` : 
            `${API_BASE_URL}/api/training/todos`;
            
        const res = await fetch(url, { headers: getHeaders() });
        const data = await res.json();
        div.innerHTML = '';
        data.forEach(h => {
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card-tkd p-3 border-bottom border-orange border-3">
                        <h5 class="text-orange fw-bold">${h.dia}</h5>
                        <p class="mb-1"><i class="bi bi-clock"></i> ${h.horaInicio}</p>
                        <p class="small text-muted mb-0">Sede: ${h.sedeNombre}</p>
                    </div>
                </div>`;
        });
    } catch (e) { div.innerHTML = "No hay horarios asignados."; }
}

// --- 🏛️ SEDES Y PROFESORES ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers: getHeaders() });
    const sedes = await res.json();
    div.innerHTML = sedes.map(s => `
        <div class="col-md-6">
            <div class="card-tkd p-4 border-start border-danger border-4">
                <h4 class="text-white">${s.nombre}</h4>
                <p class="text-muted small">📍 ${s.direccion}</p>
                <button class="btn btn-outline-warning btn-sm">Gestionar Sede</button>
            </div>
        </div>
    `).join('');
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
    const rol = getRoleFromToken();
    // Ocultar botones de Admin si es Alumno
    if (rol === 'ROLE_ALUMNO') {
        document.querySelectorAll('#nav-alumnos, #nav-profesores, #nav-sedes').forEach(el => el.style.display = 'none');
    }
});