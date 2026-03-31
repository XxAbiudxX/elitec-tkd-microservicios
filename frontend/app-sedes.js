const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers });
        const sedes = await res.json();
        div.innerHTML = '';

        sedes.forEach(s => {
            div.innerHTML += `
                <div class="col-md-6">
                    <div class="card-tkd p-4 border-start border-danger border-4 shadow">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h4 class="fw-bold text-white mb-1">${s.nombre}</h4>
                                <p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> ${s.direccion}</p>
                            </div>
                            <button class="btn btn-sm text-warning" onclick="prepararEdicionSede(${s.idSede})"><i class="bi bi-pencil-square"></i></button>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-person-badge text-danger"></i>
                            <span class="small text-light">Encargado: ${s.encargado || 'No asignado'}</span>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { div.innerHTML = "Error al conectar con el microservicio de sedes."; }
}

async function guardarSede() {
    const id = document.getElementById('s_id').value;
    const datos = {
        nombre: document.getElementById('s_nombre').value,
        direccion: document.getElementById('s_direccion').value,
        encargado: document.getElementById('s_encargado').value
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/api/sedes/${id}` : `${API_BASE_URL}/api/sedes`;

    try {
        const res = await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        if (res.ok) {
            alert("✅ Sede guardada exitosamente");
            location.reload();
        }
    } catch (e) { alert("Error al guardar sede."); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', cargarSedes);