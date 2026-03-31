const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
let alumnosCache = [];

async function cargarAlumnos() {
    const container = document.getElementById('students-list');
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers });
        if (res.ok) {
            alumnosCache = await res.json();
            renderizar(alumnosCache);
        } else {
            container.innerHTML = `<div class="alert alert-warning text-center">No se pudieron cargar los alumnos.</div>`;
        }
    } catch (e) { 
        container.innerHTML = `<div class="alert alert-danger text-center">Error de conexión con el servidor.</div>`; 
    }
}

function renderizar(lista) {
    const container = document.getElementById('students-list');
    container.innerHTML = '';
    
    if (lista.length === 0) {
        container.innerHTML = `<p class="text-center text-muted w-100 mt-4">No se encontraron alumnos.</p>`;
        return;
    }

    let html = '';
    lista.forEach((a) => {
        // Asumiendo que tu backend devuelve 'id' o 'idAlumno'. Ajusta si es diferente.
        const idReal = a.id || a.idAlumno; 
        
        html += `
            <div class="col-md-4">
                <div class="card-tkd h-100 shadow">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-warning text-dark">ALUMNO</span>
                        <button class="btn btn-sm text-danger" onclick="eliminarAlumno(${idReal})"><i class="bi bi-trash"></i></button>
                    </div>
                    <h5 class="fw-bold text-white">${a.nombre} ${a.apellido}</h5>
                    <p class="small text-muted mb-1">DNI: ${a.dni || 'N/A'}</p>
                    <p class="small text-white">Cinta: <span class="text-orange fw-bold">${a.cinta || a.cintaActual || 'Blanca'}</span></p>
                    <button class="btn btn-outline-light btn-sm w-100 mt-2" onclick="prepararEdicion(${idReal})">EDITAR DATOS</button>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

function filtrarAlumnos(val) {
    const texto = val.toLowerCase();
    const filtrados = alumnosCache.filter(a => 
        `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(texto)
    );
    renderizar(filtrados);
}

// --- LÓGICA DE FORMULARIO (GUARDAR Y EDITAR) ---

function prepararEdicion(id) {
    // Buscar el alumno en el caché por su ID
    const alumno = alumnosCache.find(a => (a.id === id || a.idAlumno === id));
    if (!alumno) return;

    // Llenar el formulario con los datos
    document.getElementById('edit_id').value = id;
    document.getElementById('a_nombre').value = alumno.nombre || '';
    document.getElementById('a_apellido').value = alumno.apellido || '';
    document.getElementById('a_dni').value = alumno.dni || '';
    document.getElementById('a_cinta').value = alumno.cinta || alumno.cintaActual || 'Blanca';
    document.getElementById('a_email').value = alumno.email || '';
    document.getElementById('a_direccion').value = alumno.direccion || '';

    // Mostrar el modal usando Bootstrap de forma programática
    const modal = new bootstrap.Modal(document.getElementById('modalAlumno'));
    modal.show();
}

async function guardarAlumno() {
    const id = document.getElementById('edit_id').value;
    const datos = {
        nombre: document.getElementById('a_nombre').value.trim(),
        apellido: document.getElementById('a_apellido').value.trim(),
        dni: document.getElementById('a_dni').value.trim(),
        cinta: document.getElementById('a_cinta').value,
        email: document.getElementById('a_email').value.trim(),
        direccion: document.getElementById('a_direccion').value.trim()
    };

    if (!datos.nombre || !datos.apellido) {
        alert("⚠️ Nombre y apellido son obligatorios.");
        return;
    }

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/api/alumnos/${id}` : `${API_BASE_URL}/api/alumnos`;

    try {
        const res = await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        if (res.ok) {
            alert("✅ Alumno guardado exitosamente");
            document.getElementById('formAlumno').reset();
            document.getElementById('edit_id').value = '';
            
            // Cerrar el modal
            const modalEl = document.getElementById('modalAlumno');
            const modalInst = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();
            
            cargarAlumnos(); // Recargar la lista
        } else {
            alert("❌ Error al guardar. Revisa los datos o el servidor.");
        }
    } catch (e) { alert("Error de conexión al guardar."); }
}

async function eliminarAlumno(id) {
    if (!confirm("⚠️ ¿Estás seguro de que deseas eliminar este alumno de la academia?")) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos/${id}`, { method: 'DELETE', headers });
        if (res.ok) {
            cargarAlumnos(); // Recargar la lista
        } else {
            alert("Error al intentar eliminar.");
        }
    } catch (e) { alert("Error de conexión al eliminar."); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Al cargar la página, se cargan los alumnos
document.addEventListener('DOMContentLoaded', cargarAlumnos);

// Limpiar el formulario cuando se cierra el modal (para que "Nueva Matrícula" salga en blanco)
document.getElementById('modalAlumno').addEventListener('hidden.bs.modal', function () {
    document.getElementById('formAlumno').reset();
    document.getElementById('edit_id').value = '';
});