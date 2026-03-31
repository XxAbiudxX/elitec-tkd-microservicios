// --- CONFIGURACIÓN DE LA NUBE ---
const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";

// --- VERIFICACIÓN DE SEGURIDAD ---
const token = localStorage.getItem('jwtToken');
if (!token) window.location.href = 'login.html'; 

function getHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// --- LÓGICA DE NAVEGACIÓN ---
let alumnosCache = []; // Variable global para manejar la edición rápida

function cerrarSesion() { 
    localStorage.clear();
    window.location.href = 'login.html';
}

function mostrarSeccion(sec) {
    document.querySelectorAll('.content-panel').forEach(el => el.style.display = 'none');
    const panel = document.getElementById('content-' + sec);
    if(panel) panel.style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="mostrarSeccion('${sec}')"]`);
    if(activeLink) activeLink.classList.add('active');

    if(sec === 'alumnos') cargarAlumnos();
    if(sec === 'sedes') cargarSedes();
}

// --- 👤 MÓDULO PERFIL INTELIGENTE (SENSEI) ---
function toggleEdicion(editando) {
    document.getElementById('perfil-vista').style.display = editando ? 'none' : 'block';
    document.getElementById('perfil-editor').style.display = editando ? 'block' : 'none';
}

async function cargarDatosPerfil() {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers: getHeaders() });
        if (res.ok) {
            const u = await res.json();
            document.getElementById('v_dni').innerText = u.dni || 'Pendiente';
            document.getElementById('v_telefono').innerText = u.telefono || 'Pendiente';
            document.getElementById('v_direccion').innerText = u.direccion || 'Pendiente';
            document.getElementById('v_fechaNac').innerText = u.fechaNacimiento || 'Pendiente';

            document.getElementById('p_dni').value = u.dni || '';
            document.getElementById('p_telefono').value = u.telefono || '';
            document.getElementById('p_direccion').value = u.direccion || '';
            document.getElementById('p_fechaNac').value = u.fechaNacimiento || '';

            const estaCompleto = u.dni && u.telefono && u.direccion && u.fechaNacimiento;
            const btnEdit = document.getElementById('btn-editar-perfil');
            btnEdit.disabled = !!estaCompleto;
            if(estaCompleto) {
                btnEdit.innerHTML = '<i class="bi bi-check-all"></i> Ficha Completa (Validada)';
                btnEdit.className = 'btn btn-success w-100 py-2';
            }
        }
    } catch (e) { console.error(e); }
}

async function guardarPerfil() {
    const datosPerfil = {
        email: localStorage.getItem('userEmail'),
        dni: document.getElementById('p_dni').value,
        telefono: document.getElementById('p_telefono').value,
        direccion: document.getElementById('p_direccion').value,
        fechaNacimiento: document.getElementById('p_fechaNac').value
    };
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(datosPerfil)
        });
        if (res.ok) { alert("✅ ¡Perfil actualizado!"); toggleEdicion(false); cargarDatosPerfil(); }
    } catch (e) { alert("❌ Error: " + e.message); }
}

// --- 🥋 MÓDULO ALUMNOS ---

async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        alumnosCache = await res.json(); // Guardamos en cache para el "Ver Ficha"
        div.innerHTML = '';
        
        if(!Array.isArray(alumnosCache) || alumnosCache.length === 0) {
            div.innerHTML = '<div class="alert alert-warning w-100 text-center">No hay alumnos en el Dojo.</div>';
            return;
        }

        alumnosCache.forEach((a, index) => {
            const nombreMostrar = a.nombre || '<span class="text-danger">Sin nombre</span>';
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-start border-primary border-4 card-hover">
                        <div class="card-body">
                            <h5 class="fw-bold text-dark">${nombreMostrar} ${a.apellido || ''}</h5>
                            <p class="text-muted small mb-1">📧 ${a.correo || '-'}</p>
                            <p class="text-muted small mb-2">🪪 DNI: ${a.dni || '-'}</p>
                            <span class="badge bg-dark mb-3">Cinta: ${a.cintaActual || 'Blanca'}</span>
                            <div class="d-grid">
                                <button class="btn btn-sm btn-outline-primary" onclick="verDetalle(${index})">
                                    <i class="bi bi-eye"></i> Ver Ficha / Gestionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { div.innerHTML = `<div class="alert alert-danger w-100">Error de conexión.</div>`; }
}

// --- CARGAR DATOS EN EL MODAL DE DETALLE ---
function verDetalle(index) {
    const a = alumnosCache[index];
    
    // Llenamos el formulario del modal de gestión
    document.getElementById('edit_id').value = a.idAlumno;
    document.getElementById('edit_nombre').value = a.nombre || '';
    document.getElementById('edit_apellido').value = a.apellido || '';
    document.getElementById('edit_dni').value = a.dni || '';
    document.getElementById('edit_telefono').value = a.telefono || '';
    document.getElementById('edit_direccion').value = a.direccion || '';
    document.getElementById('edit_correo').value = a.correo || '';
    document.getElementById('edit_cinta').value = a.cintaActual || 'Blanca';
    document.getElementById('edit_ingreso').value = a.fechaIngreso || '';

    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();
}

// --- ACTUALIZAR DATOS DEL ALUMNO ---
async function actualizarAlumno() {
    const id = document.getElementById('edit_id').value;
    const datos = {
        nombre: document.getElementById('edit_nombre').value,
        apellido: document.getElementById('edit_apellido').value,
        dni: document.getElementById('edit_dni').value,
        telefono: document.getElementById('edit_telefono').value,
        direccion: document.getElementById('edit_direccion').value,
        correo: document.getElementById('edit_correo').value,
        cintaActual: document.getElementById('edit_cinta').value,
        fechaIngreso: document.getElementById('edit_ingreso').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("✅ Datos actualizados correctamente.");
            bootstrap.Modal.getInstance(document.getElementById('modalDetalle')).hide();
            cargarAlumnos();
        }
    } catch (e) { alert("❌ Error al actualizar."); }
}

// --- ELIMINAR DESDE LA FICHA ---
async function eliminarAlumnoDesdeFicha() {
    const id = document.getElementById('edit_id').value;
    const nombre = document.getElementById('edit_nombre').value;
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (res.ok) {
            alert("🗑️ Alumno eliminado.");
            bootstrap.Modal.getInstance(document.getElementById('modalDetalle')).hide();
            cargarAlumnos();
        }
    } catch (e) { alert("❌ Error al eliminar."); }
}

async function guardarAlumno() {
    const btn = document.querySelector('button[onclick="guardarAlumno()"]');
    btn.disabled = true;
    btn.innerHTML = 'Registrando...';

    const nuevoAlumno = {
        nombre: document.getElementById('a_nombre').value.trim(),
        apellido: document.getElementById('a_apellido').value.trim(),
        dni: document.getElementById('a_dni').value,
        telefono: document.getElementById('a_telefono').value,
        correo: document.getElementById('a_email').value,
        direccion: document.getElementById('a_direccion').value,
        cintaActual: document.getElementById('a_cinta').value,
        fechaNacimiento: document.getElementById('a_fechaNac').value,
        fechaIngreso: document.getElementById('a_fechaIngreso').value
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(nuevoAlumno)
        });

        if (res.ok) {
            alert("🥋 ¡Alumno registrado!");
            bootstrap.Modal.getInstance(document.getElementById('modalAlumno')).hide();
            document.getElementById('formAlumno').reset();
            cargarAlumnos();
        } else {
            const txt = await res.text();
            alert("❌ Error: " + txt);
        }
    } catch (e) { alert("❌ Error de red."); }
    finally { btn.disabled = false; btn.innerHTML = 'Registrar Alumno'; }
}

// --- ASISTENCIA (SIMULADO) ---
function marcarAsistencia() {
    alert("✅ Asistencia marcada para el día de hoy.");
}

// --- 🏛️ MÓDULO SEDES ---
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
    cargarDatosPerfil();
});