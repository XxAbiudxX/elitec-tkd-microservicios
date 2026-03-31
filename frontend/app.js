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
    // Ocultar todos los paneles
    document.querySelectorAll('.content-panel').forEach(el => el.style.display = 'none');
    const panel = document.getElementById('content-' + sec);
    if(panel) panel.style.display = 'block';
    
    // Actualizar Navbar
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    // Usamos querySelector para marcar el link activo si el evento no existe
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

    document.querySelectorAll('.dato-valor').forEach(el => el.innerText = 'Buscando...');

    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me?email=${email}`, { headers: getHeaders() });

        if (res.ok) {
            const u = await res.json();
            
            // Llenar Vista
            document.getElementById('v_dni').innerText = u.dni || 'Pendiente';
            document.getElementById('v_telefono').innerText = u.telefono || 'Pendiente';
            document.getElementById('v_direccion').innerText = u.direccion || 'Pendiente';
            document.getElementById('v_fechaNac').innerText = u.fechaNacimiento || 'Pendiente';

            // Llenar Editor
            document.getElementById('p_dni').value = u.dni || '';
            document.getElementById('p_telefono').value = u.telefono || '';
            document.getElementById('p_direccion').value = u.direccion || '';
            document.getElementById('p_fechaNac').value = u.fechaNacimiento || '';

            // Lógica de Bloqueo Automático
            const estaCompleto = u.dni && u.telefono && u.direccion && u.fechaNacimiento;
            const btnEdit = document.getElementById('btn-editar-perfil');
            
            if (estaCompleto) {
                btnEdit.innerHTML = '<i class="bi bi-check-all"></i> Ficha Completa (Validada)';
                btnEdit.className = 'btn btn-success w-100 py-2';
                btnEdit.disabled = true;
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
            alert("✅ ¡Datos de Sensei actualizados!");
            toggleEdicion(false);
            cargarDatosPerfil();
        } else {
            alert("❌ Error al guardar perfil.");
        }
    } catch (e) {
        alert("❌ Error de red: " + e.message);
    }
}

// --- 🥋 MÓDULO ALUMNOS ---

async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers: getHeaders() });
        
        if(!res.ok) {
            div.innerHTML = `<div class="alert alert-danger w-100">Error ${res.status}: Problema al conectar con el servicio de alumnos.</div>`;
            return;
        }
        
        const alumnos = await res.json();
        
        if(!Array.isArray(alumnos)) {
            div.innerHTML = '<div class="alert alert-warning w-100">Error: Formato de datos no válido.</div>';
            return;
        }

        div.innerHTML = '';
        
        if(alumnos.length === 0) {
            div.innerHTML = '<div class="alert alert-warning w-100">No hay alumnos registrados en el Dojo todavía.</div>';
            return;
        }

        alumnos.forEach((a) => {
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
    } catch (e) { 
        div.innerHTML = `<div class="alert alert-danger w-100">Error de conexión: Verifica que el microservicio esté activo.</div>`;
    }
}

async function guardarAlumno() {
    // Usamos el botón directo para evitar errores de contexto de evento
    const btn = document.querySelector('button[onclick="guardarAlumno()"]');
    if(btn) {
        btn.disabled = true;
        btn.innerHTML = 'Registrando...';
    }

    const nuevoAlumno = {
        nombre: document.getElementById('a_nombre').value,
        apellido: document.getElementById('a_apellido').value,
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
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(nuevoAlumno)
        });

        if (res.ok) {
            alert("🥋 ¡Alumno registrado con éxito!");
            // Cerrar modal de forma segura
            const modalEl = document.getElementById('modalAlumno');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if(modal) modal.hide();
            
            document.getElementById('formAlumno').reset();
            cargarAlumnos();
        } else {
            const txt = await res.json();
            alert("❌ Error al registrar: " + (txt.message || "Verifica que el DNI no esté repetido"));
        }
    } catch (e) {
        alert("❌ Error de red: No se pudo contactar con el Student-Service.");
    } finally {
        if(btn) {
            btn.disabled = false;
            btn.innerHTML = 'Registrar Alumno';
        }
    }
}

// --- 🏛️ MÓDULO SEDES ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-danger"></div></div>';
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers: getHeaders() });
        if(!res.ok) throw new Error("Error en sedes");
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
    } catch (e) { 
        div.innerHTML = '<div class="alert alert-danger w-100">Error al cargar las Sedes.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema Elitec TKD: Dashboard iniciado correctamente.");
});