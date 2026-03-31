// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');

if (!token) window.location.href = 'login.html';

// Decodificar el Rol del JWT (Sin librerías externas)
function getRoleFromToken() {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.role || payload.roles || 'USER'; 
    } catch (e) { return 'USER'; }
}

function getHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// --- 🚀 NAVEGACIÓN Y PERMISOS ---
function switchTab(sectionId, element) {
    const rol = getRoleFromToken();

    // Bloqueo de seguridad: Si un alumno intenta entrar a sedes o alumnos (URL/Consola)
    if ((sectionId === 'alumnos' || sectionId === 'sedes') && rol === 'ROLE_ALUMNO') {
        alert("Acceso restringido: Solo para Instructores o Administradores.");
        return;
    }

    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById('sec-' + sectionId).classList.add('active');
    element.classList.add('active');

    if(sectionId === 'alumnos') cargarAlumnos();
    if(sectionId === 'sedes') cargarSedes();
    if(sectionId === 'perfil') cargarDatosPerfil();
}

// --- 👤 MI PERFIL (COMPLETAR Y EDITAR) ---
async function cargarDatosPerfil() {
    const email = localStorage.getItem('userEmail');
    const container = document.getElementById('perfil-data-grid');
    container.innerHTML = '<div class="spinner-border text-light"></div>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers: getHeaders() });
        if (res.ok) {
            const u = await res.json();
            document.getElementById('p-nombre-header').innerText = `${u.nombre} ${u.apellido}`;
            
            // Renderizado de datos estilo cuadrícula universitaria
            container.innerHTML = `
                <div class="col-md-6 mb-4">
                    <label class="text-muted small">DOCUMENTO DE IDENTIDAD</label>
                    <p class="fw-bold mb-0">${u.dni || 'PENDIENTE'}</p>
                </div>
                <div class="col-md-6 mb-4">
                    <label class="text-muted small">CORREO INSTITUCIONAL</label>
                    <p class="fw-bold mb-0">${u.email}</p>
                </div>
                <div class="col-md-6 mb-4">
                    <label class="text-muted small">CELULAR / CONTACTO</label>
                    <input type="text" id="edit-p-tel" class="form-control bg-dark text-white border-secondary" value="${u.telefono || ''}" placeholder="Escribe tu celular">
                </div>
                <div class="col-md-6 mb-4">
                    <label class="text-muted small">DIRECCIÓN DE RESIDENCIA</label>
                    <input type="text" id="edit-p-dir" class="form-control bg-dark text-white border-secondary" value="${u.direccion || ''}" placeholder="Escribe tu dirección">
                </div>
                <div class="col-12 mt-2">
                    <button class="btn btn-tkd w-auto" onclick="actualizarMiPerfil()">
                        <i class="bi bi-save"></i> ACTUALIZAR MIS DATOS
                    </button>
                </div>
            `;
        }
    } catch (e) { container.innerHTML = "Error al cargar perfil."; }
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
        if (res.ok) alert("✅ ¡Perfil actualizado con éxito!");
    } catch (e) { alert("Error de conexión"); }
}

// --- 🥋 GESTIÓN DE ALUMNOS (FILTROS Y CRUD) ---
let alumnosCache = [];

async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="spinner-border text-warning"></div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        alumnosCache = await res.json();
        renderizarListaAlumnos(alumnosCache);
    } catch (e) { div.innerHTML = "Error de red."; }
}

// Lógica de Filtrado Dinámico
function filtrarAlumnos(busqueda) {
    const filtrados = alumnosCache.filter(a => 
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        a.dni.includes(busqueda) ||
        a.apellido.toLowerCase().includes(busqueda.toLowerCase())
    );
    renderizarListaAlumnos(filtrados);
}

function renderizarListaAlumnos(lista) {
    const div = document.getElementById('students-list');
    const rol = getRoleFromToken();
    div.innerHTML = '';

    lista.forEach((a, index) => {
        div.innerHTML += `
            <div class="col-md-4">
                <div class="card card-tkd h-100 shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <span class="badge bg-warning text-dark">PRESENCIAL</span>
                            ${rol === 'ROLE_ADMIN' ? 
                                `<button class="btn btn-sm text-danger" onclick="eliminarAlumno(${a.idAlumno})"><i class="bi bi-trash"></i></button>` : ''}
                        </div>
                        <h5 class="fw-bold text-white mt-2">${a.nombre} ${a.apellido}</h5>
                        <p class="small text-muted mb-1">DNI: ${a.dni}</p>
                        <p class="small text-white">Cinta: ${a.cintaActual}</p>
                        <button class="btn btn-tkd mt-2" onclick="verDetalle(${index})">
                            GESTIONAR <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

// --- 🏛️ SEDES (SEGURIDAD POR SEDE) ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers: getHeaders() });
        const sedes = await res.json();
        div.innerHTML = '';
        sedes.forEach(s => {
            div.innerHTML += `
                <div class="col-md-6">
                    <div class="card-tkd p-4 border-start border-danger border-4">
                        <h4 class="text-white">${s.nombre}</h4>
                        <p class="text-muted small">📍 Direccion: ${s.direccion}</p>
                        <button class="btn btn-outline-light btn-sm" onclick="alert('Ver horarios de esta sede')">Ver Horarios</button>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // Al cargar, ocultamos botones del sidebar si es alumno
    const rol = getRoleFromToken();
    if (rol === 'ROLE_ALUMNO') {
        document.querySelector('[onclick*="alumnos"]').style.display = 'none';
    }
});