const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
let alumnosCache = [];

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarAlumnos() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/alumnos`, { headers });
        alumnosCache = await res.json();
        renderizar(alumnosCache);
    } catch (e) { alert("Error al cargar alumnos"); }
}

function renderizar(lista) {
    const container = document.getElementById('students-list');
    container.innerHTML = '';
    lista.forEach((a, i) => {
        container.innerHTML += `
            <div class="col-md-4">
                <div class="card-tkd h-100 shadow">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-warning text-dark">ALUMNO</span>
                        <button class="btn btn-sm text-danger" onclick="eliminar(${a.idAlumno})"><i class="bi bi-trash"></i></button>
                    </div>
                    <h5 class="fw-bold">${a.nombre} ${a.apellido}</h5>
                    <p class="small text-muted mb-1">DNI: ${a.dni}</p>
                    <p class="small text-white">Cinta: <span class="text-orange">${a.cintaActual}</span></p>
                    <button class="btn btn-outline-light btn-sm w-100 mt-2" onclick="prepararEdicion(${i})">EDITAR DATOS</button>
                </div>
            </div>`;
    });
}

function filtrarAlumnos(val) {
    const f = alumnosCache.filter(a => `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(val.toLowerCase()));
    renderizar(f);
}

// ... Funciones de Guardar y Eliminar que ya tenías ...

document.addEventListener('DOMContentLoaded', cargarAlumnos);