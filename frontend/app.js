// --- VERIFICACIÓN DE SEGURIDAD ---
const token = localStorage.getItem('jwtToken');
if (!token) {
    window.location.href = 'login.html'; // Si no hay pase, lo devolvemos a la puerta
}

// Función para incluir siempre el Token
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- LÓGICA DE NAVEGACIÓN ---
let alumnosCache = [];
let alumnoSeleccionadoId = null;

function cerrarSesion() { 
    localStorage.removeItem('jwtToken');
    window.location.href = 'login.html';
}

function mostrarSeccion(sec) {
    document.querySelectorAll('.content-panel').forEach(el => el.style.display = 'none');
    document.getElementById('content-' + sec).style.display = 'block';
    
    // Cambiar la pestaña activa en el Navbar visualmente
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    if(sec === 'alumnos') cargarAlumnos();
    if(sec === 'sedes') cargarSedes();
}

// --- MÓDULO ALUMNOS (COMPLETO) ---
async function cargarAlumnos() {
    const div = document.getElementById('students-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div></div>';
    try {
        const res = await fetch('http://localhost:8080/api/alumnos', { headers: getHeaders() });
        if(res.status === 401) { alert("Sesión expirada."); cerrarSesion(); return; }
        
        alumnosCache = await res.json();
        div.innerHTML = '';
        if(alumnosCache.length === 0) div.innerHTML = '<div class="alert alert-warning w-100">No hay alumnos.</div>';
        
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
                                <button class="btn btn-sm btn-outline-info" onclick="verHistorial(${index})"><i class="bi bi-clock-history"></i> Historial</button>
                                <button class="btn btn-sm btn-outline-primary" onclick="verDetalle(${index})"><i class="bi bi-eye"></i> Ver Ficha</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { div.innerHTML = `<div class="alert alert-danger w-100">Error: ${e.message}</div>`; }
}

async function guardarAlumno() {
    const alumno = {
        nombre: document.getElementById('a_nombre').value, apellido: document.getElementById('a_apellido').value,
        dni: document.getElementById('a_dni').value, fechaNacimiento: document.getElementById('a_fechaNac').value,
        telefono: document.getElementById('a_telefono').value, correo: document.getElementById('a_email').value,
        direccion: document.getElementById('a_direccion').value, cintaActual: document.getElementById('a_cinta').value,
        fechaIngreso: document.getElementById('a_fechaIngreso').value
    };
    try {
        const res = await fetch('http://localhost:8080/api/alumnos', { 
            method: 'POST', headers: getHeaders(), body: JSON.stringify(alumno) 
        });
        if(res.ok) { 
            alert('✅ Alumno registrado'); 
            bootstrap.Modal.getInstance(document.getElementById('modalAlumno')).hide(); 
            document.getElementById('formAlumno').reset(); 
            cargarAlumnos(); 
        } else alert('❌ Error al guardar.');
    } catch(e) { alert('Error: '+e); }
}

function verDetalle(index) {
    const a = alumnosCache[index];
    document.getElementById('d_nombreCompleto').innerText = `${a.nombre} ${a.apellido}`;
    document.getElementById('d_cinta').innerText = `Cinta ${a.cintaActual}`;
    document.getElementById('d_correo').innerText = a.correo || '-';
    document.getElementById('d_telefono').innerText = a.telefono || '-';
    document.getElementById('d_dni').innerText = a.dni || '-';
    document.getElementById('d_direccion').innerText = a.direccion || '-';
    document.getElementById('d_ingreso').innerText = a.fechaIngreso || '-';
    new bootstrap.Modal(document.getElementById('modalDetalle')).show();
}

// --- MÓDULO SEDES (ACADEMIAS) ---
async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    div.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-danger"></div></div>';
    try {
        const res = await fetch('http://localhost:8080/api/sedes', { headers: getHeaders() });
        const data = await res.json();
        div.innerHTML = '';
        if(data.length === 0) div.innerHTML = '<div class="alert alert-warning w-100">No hay sedes registradas.</div>';

        data.forEach(s => {
            div.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm border-start border-danger border-4">
                        <div class="card-body">
                            <h5 class="text-danger fw-bold">🥋 ${s.nombre}</h5>
                            <p class="small mb-0">📍 ${s.direccion}</p>
                            <p class="small mb-0">📞 ${s.telefono}</p>
                            <p class="small mb-0">👤 Encargado: ${s.encargado}</p>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { div.innerHTML = `<div class="alert alert-danger w-100">Error conectando al servicio de Sedes.</div>`; }
}

async function guardarSede() {
    const sede = { 
        nombre: document.getElementById('s_nombre').value, 
        direccion: document.getElementById('s_direccion').value, 
        telefono: document.getElementById('s_telefono').value, 
        encargado: document.getElementById('s_encargado').value 
    };
    try {
        const res = await fetch('http://localhost:8080/api/sedes', { 
            method: 'POST', headers: getHeaders(), body: JSON.stringify(sede) 
        });
        if(res.ok) { 
            alert('✅ Sede (Academia) registrada'); 
            bootstrap.Modal.getInstance(document.getElementById('modalSede')).hide(); 
            document.getElementById('formSede').reset(); 
            cargarSedes(); 
        } else alert('❌ Error al guardar sede.');
    } catch(e) { alert('Error: '+e); }
}

// (Tus funciones abrirAsistencia, guardarAsistencia y verHistorial van aquí, iguales a como te las pasé antes, usando "getHeaders()")