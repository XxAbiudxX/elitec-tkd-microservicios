// --- CONFIGURACIÓN DE LA NUBE ---
// Reemplaza con tu link real del Gateway de Railway
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";

// --- VERIFICACIÓN DE SEGURIDAD (LA CERRADURA) ---
const token = localStorage.getItem('jwtToken');
if (!token) {
    // Si no hay pase, lo devolvemos a la puerta de inmediato
    window.location.href = 'login.html'; 
}

// Función para incluir siempre el Token en las peticiones
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- LÓGICA DE NAVEGACIÓN ---
let alumnosCache = [];

function cerrarSesion() { 
    localStorage.removeItem('jwtToken');
    window.location.href = 'login.html';
}

function mostrarSeccion(sec) {
    // Ocultar paneles
    document.querySelectorAll('.content-panel').forEach(el => el.style.display = 'none');
    // Mostrar el seleccionado
    const panel = document.getElementById('content-' + sec);
    if(panel) panel.style.display = 'block';
    
    // Actualizar Navbar visualmente
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    // Si el evento existe (clic), marcamos como activo
    if(event && event.target) event.target.classList.add('active');

    // Cargar datos según la sección
    if(sec === 'alumnos') cargarAlumnos();
    if(sec === 'sedes') cargarSedes();
}

// --- MÓDULO ALUMNOS ---
async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
        // Petición al Gateway en la nube
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        
        if(res.status === 401) { 
            alert("Sesión expirada o no autorizada."); 
            cerrarSesion(); 
            return; 
        }
        
        alumnosCache = await res.json();
        div.innerHTML = '';
        
        if(alumnosCache.length === 0) {
            div.innerHTML = '<div class="alert alert-warning w-100">No hay alumnos registrados en el Dojo todavía.</div>';
            return;
        }
        
        alumnosCache.forEach((a, index) => {
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-start border-primary border-4 card-hover">
                        <div class="card-body">
                            <h5 class="fw-bold text-dark">${a.nombre} ${a.apellido}</h5>
                            <p class="text-muted small mb-1">📧 ${a.correo || '-'}</p>
                            <p class="text-muted small mb-2">🪪 DNI: ${a.dni || '-'}</p>
                            <span class="badge bg-dark mb-3">Cinta: ${a.cintaActual || 'Blanca'}</span>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-sm btn-outline-success" onclick="abrirAsistencia(${index})"><i class="bi bi-calendar-check"></i> Asistencia</button>
                                <button class="btn btn-sm btn-outline-primary" onclick="verDetalle(${index})"><i class="bi bi-eye"></i> Ver Ficha</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { 
        div.innerHTML = `<div class="alert alert-danger w-100">Error conectando al servicio de Alumnos: ${e.message}</div>`; 
    }
}

// --- MÓDULO SEDES ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-danger"></div></div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers: getHeaders() });
        const data = await res.json();
        div.innerHTML = '';
        
        if(data.length === 0) {
            div.innerHTML = '<div class="alert alert-warning w-100">No hay sedes registradas.</div>';
            return;
        }

        data.forEach(s => {
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-start border-danger border-4">
                        <div class="card-body">
                            <h5 class="text-danger fw-bold">🥋 ${s.nombre}</h5>
                            <p class="small mb-0">📍 ${s.direccion}</p>
                            <p class="small mb-0">👤 Encargado: ${s.encargado}</p>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { 
        div.innerHTML = `<div class="alert alert-danger w-100">Error conectando al servicio de Sedes en Railway.</div>`; 
    }
}

// --- CARGA INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema Elitec TKD: Conexión establecida.");
});