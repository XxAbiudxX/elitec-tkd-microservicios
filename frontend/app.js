// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";

// --- VERIFICACIÓN DE SEGURIDAD ---
const token = localStorage.getItem('jwtToken');
if (!token) {
    window.location.href = 'login.html'; 
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- LÓGICA DE NAVEGACIÓN ---
function cerrarSesion() { 
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

function mostrarSeccion(sec) {
    document.querySelectorAll('.content-panel').forEach(el => el.style.display = 'none');
    const panel = document.getElementById('content-' + sec);
    if(panel) panel.style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if(event && event.target && event.target.classList.contains('nav-link')) {
        event.target.classList.add('active');
    }

    if(sec === 'alumnos') cargarAlumnos();
    if(sec === 'sedes') cargarSedes();
}

// --- 👤 MÓDULO PERFIL INTELIGENTE ---

// 1. Intercambio entre Vista y Formulario
function toggleEdicion(editando) {
    document.getElementById('perfil-vista').style.display = editando ? 'none' : 'block';
    document.getElementById('perfil-editor').style.display = editando ? 'block' : 'none';
}

// 2. Cargar datos desde Neon al abrir el Modal
async function cargarDatosPerfil() {
    const email = localStorage.getItem('userEmail');
    if (!email) {
        alert("Sesión no encontrada.");
        return;
    }

    try {
        // Hacemos un GET para traer los datos actuales (Asegúrate de crear este endpoint en el backend)
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers: getHeaders() });
        
        if (res.ok) {
            const u = await res.json();
            
            // Llenar la Vista (texto)
            document.getElementById('v_dni').innerText = u.dni || 'Pendiente';
            document.getElementById('v_telefono').innerText = u.telefono || 'Pendiente';
            document.getElementById('v_direccion').innerText = u.direccion || 'Pendiente';
            document.getElementById('v_fechaNac').innerText = u.fechaNacimiento || 'Pendiente';

            // Llenar el Editor (inputs)
            document.getElementById('p_dni').value = u.dni || '';
            document.getElementById('p_telefono').value = u.telefono || '';
            document.getElementById('p_direccion').value = u.direccion || '';
            document.getElementById('p_fechaNac').value = u.fechaNacimiento || '';

            // BLOQUEO: Si todo está completo, deshabilitamos la edición
            const estaCompleto = u.dni && u.telefono && u.direccion && u.fechaNacimiento;
            const btnEdit = document.getElementById('btn-editar-perfil');
            
            if (estaCompleto) {
                btnEdit.innerHTML = '<i class="bi bi-check-all"></i> Ficha Completa (Validada)';
                btnEdit.className = 'btn btn-success w-100 py-2';
                btnEdit.disabled = true; // El Sensei ya tiene su ficha lista
            } else {
                btnEdit.innerHTML = '<i class="bi bi-pencil-square"></i> Completar / Editar Datos';
                btnEdit.className = 'btn btn-primary w-100 py-2';
                btnEdit.disabled = false;
            }
        }
    } catch (e) {
        console.error("Error al cargar perfil:", e);
    }
}

// 3. Guardar cambios y volver a vista
async function guardarPerfil() {
    const emailStored = localStorage.getItem('userEmail');
    const datosPerfil = {
        email: emailStored,
        dni: document.getElementById('p_dni').value,
        telefono: document.getElementById('p_telefono').value,
        direccion: document.getElementById('p_direccion').value,
        fechaNacimiento: document.getElementById('p_fechaNac').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(datosPerfil)
        });

        if (res.ok) {
            alert("✅ ¡Datos actualizados!");
            toggleEdicion(false); // Volver a la vista
            cargarDatosPerfil();  // Refrescar los textos y verificar si se bloquea
        } else {
            alert("❌ Error al guardar.");
        }
    } catch (e) {
        alert("❌ Error de red: " + e.message);
    }
}

// --- 🥋 MÓDULO ALUMNOS (Igual que antes) ---
async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div></div>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        if(res.status === 401) { cerrarSesion(); return; }
        const alumnosCache = await res.json();
        div.innerHTML = '';
        if(alumnosCache.length === 0) {
            div.innerHTML = '<div class="alert alert-warning w-100">No hay alumnos registrados.</div>';
            return;
        }
        alumnosCache.forEach((a) => {
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-start border-primary border-4 card-hover">
                        <div class="card-body">
                            <h5 class="fw-bold text-dark">${a.nombre} ${a.apellido}</h5>
                            <p class="text-muted small mb-1">📧 ${a.correo || '-'}</p>
                            <p class="text-muted small mb-2">🪪 DNI: ${a.dni || '-'}</p>
                            <span class="badge bg-dark mb-3">Cinta: ${a.cintaActual || 'Blanca'}</span>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

// --- 🏛️ MÓDULO SEDES (Igual que antes) ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-danger"></div></div>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers: getHeaders() });
        const data = await res.json();
        div.innerHTML = '';
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
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema Elitec TKD: Dashboard listo.");
});