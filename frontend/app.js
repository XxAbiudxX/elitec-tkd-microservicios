// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";

// --- VERIFICACIÓN DE SEGURIDAD AL CARGAR ---
const token = localStorage.getItem('jwtToken');
if (!token) {
    window.location.href = 'login.html'; 
}

function getHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// --- 🚀 NAVEGACIÓN TIPO "DASHBOARD" ---
// Esta función reemplaza a mostrarSeccion para manejar el Sidebar
function switchTab(sectionId, element) {
    // 1. Ocultar todas las secciones del contenido principal
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // 2. Quitar el estado activo de todos los botones del Sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // 3. Mostrar la sección seleccionada y activar su botón
    const targetSection = document.getElementById('sec-' + sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        element.classList.add('active');
    }

    // 4. Carga inteligente de datos según la pestaña
    switch(sectionId) {
        case 'alumnos': cargarAlumnos(); break;
        case 'sedes': cargarSedes(); break;
        case 'perfil': cargarDatosPerfil(); break;
    }
}

function cerrarSesion() { 
    localStorage.clear();
    window.location.href = 'login.html';
}

// --- 👤 MÓDULO PERFIL ESTILO UNIVERSITARIO ---
async function cargarDatosPerfil() {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers: getHeaders() });
        if (res.ok) {
            const u = await res.json();
            
            // Llenar el "Encabezado" del perfil (Foto y Nombre)
            document.getElementById('p-nombre').innerText = `${u.nombre || 'Sensei'} ${u.apellido || ''}`;
            
            // Llenar la cuadrícula de datos (Lado izquierdo de tu captura)
            const perfilDataContainer = document.getElementById('perfil-data');
            perfilDataContainer.innerHTML = `
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DOCUMENTO DE IDENTIDAD</p>
                    <p class="fw-bold text-white">${u.dni || 'No registrado'}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">CORREO ELECTRÓNICO</p>
                    <p class="fw-bold text-white">${email}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">TELÉFONO / CELULAR</p>
                    <p class="fw-bold text-white">${u.telefono || 'Pendiente'}</p>
                </div>
                <div class="col-md-6 mb-3">
                    <p class="text-muted small mb-0">DIRECCIÓN ACTUAL</p>
                    <p class="fw-bold text-white text-uppercase">${u.direccion || 'No especificada'}</p>
                </div>
            `;
        }
    } catch (e) { console.error("Error al cargar perfil universitario:", e); }
}

// --- 🥋 MÓDULO ALUMNOS (VISTA DE CURSOS) ---
let alumnosCache = [];

async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-warning"></div><p>Cargando lista de alumnos...</p></div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        alumnosCache = await res.json();
        div.innerHTML = '';
        
        if(!Array.isArray(alumnosCache) || alumnosCache.length === 0) {
            div.innerHTML = '<div class="col-12 text-center mt-5"><h5>No hay alumnos registrados.</h5></div>';
            return;
        }

        alumnosCache.forEach((a, index) => {
            // Estructura de tarjeta imitando la de "Innovación y Tecnología" de tu captura
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card card-tkd h-100 shadow-sm border-0">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-warning text-dark px-3 py-2">PRESENCIAL</span>
                                <small class="text-muted"><i class="bi bi-clock"></i> Ingreso: ${a.fechaIngreso || '2026-I'}</small>
                            </div>
                            <h5 class="fw-bold text-white mb-3 text-uppercase">${a.nombre} ${a.apellido}</h5>
                            <div class="d-flex align-items-center mb-3">
                                <i class="bi bi-person-circle fs-3 me-2 text-secondary"></i>
                                <div>
                                    <p class="small mb-0 text-muted">DNI: ${a.dni}</p>
                                    <p class="small mb-0 text-white">Cinta: ${a.cintaActual}</p>
                                </div>
                            </div>
                            <button class="btn btn-tkd w-100 mt-2" onclick="verDetalle(${index})">
                                GESTIONAR ALUMNO <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { div.innerHTML = `<div class="alert alert-danger">Error de red al conectar con el Dojo.</div>`; }
}

// --- 🏛️ MÓDULO SEDES ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    div.innerHTML = '<div class="spinner-border text-danger"></div>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers: getHeaders() });
        const data = await res.json();
        div.innerHTML = '';
        data.forEach(s => {
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card card-tkd p-3 border-start border-danger border-4">
                        <h5 class="fw-bold text-white"><i class="bi bi-geo-alt"></i> ${s.nombre}</h5>
                        <p class="small text-muted mb-0">Encargado: ${s.encargado}</p>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

// --- GESTIÓN DE MODALES (EDICIÓN Y REGISTRO) ---
function verDetalle(index) {
    const a = alumnosCache[index];
    document.getElementById('edit_id').value = a.idAlumno;
    document.getElementById('edit_nombre').value = a.nombre || '';
    document.getElementById('edit_apellido').value = a.apellido || '';
    document.getElementById('edit_dni').value = a.dni || '';
    document.getElementById('edit_cinta').value = a.cintaActual || 'Blanca';

    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();
}

// Cargar dashboard inicial al entrar
document.addEventListener('DOMContentLoaded', () => {
    console.log("Elitec TKD 2.0: Sistema iniciado.");
});