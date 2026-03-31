const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
let sedesCache = [];

async function cargarSedes() {
    const div = document.getElementById('sedes-list');
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers });
        if (res.ok) {
            sedesCache = await res.json();
            div.innerHTML = '';

            if (sedesCache.length === 0) {
                div.innerHTML = `<p class="text-center text-muted w-100 mt-4">No hay sedes registradas.</p>`;
                return;
            }

            let html = '';
            sedesCache.forEach(s => {
                const idReal = s.id || s.idSede;
                html += `
                    <div class="col-md-6">
                        <div class="card-tkd p-4 border-start border-danger border-4 shadow">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h4 class="fw-bold text-white mb-1">${s.nombre}</h4>
                                    <p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> ${s.direccion}</p>
                                </div>
                                <div>
                                    <button class="btn btn-sm text-warning me-2" onclick="prepararEdicionSede(${idReal})"><i class="bi bi-pencil-square"></i></button>
                                    <button class="btn btn-sm text-danger" onclick="eliminarSede(${idReal})"><i class="bi bi-trash"></i></button>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-person-badge text-danger"></i>
                                <span class="small text-light">Encargado: ${s.encargado || 'No asignado'}</span>
                            </div>
                        </div>
                    </div>`;
            });
            div.innerHTML = html;
        }
    } catch (e) { 
        div.innerHTML = `<div class="alert alert-danger text-center">Error al conectar con el microservicio de sedes.</div>`; 
    }
}

function prepararEdicionSede(id) {
    const sede = sedesCache.find(s => (s.id === id || s.idSede === id));
    if (!sede) return;

    document.getElementById('s_id').value = id;
    document.getElementById('s_nombre').value = sede.nombre || '';
    document.getElementById('s_direccion').value = sede.direccion || '';
    document.getElementById('s_encargado').value = sede.encargado || '';

    const modal = new bootstrap.Modal(document.getElementById('modalSede'));
    modal.show();
}

async function guardarSede() {
    const id = document.getElementById('s_id').value;
    const datos = {
        nombre: document.getElementById('s_nombre').value.trim(),
        direccion: document.getElementById('s_direccion').value.trim(),
        encargado: document.getElementById('s_encargado').value.trim()
    };

    if (!datos.nombre || !datos.direccion) {
        alert("⚠️ Nombre y dirección son obligatorios.");
        return;
    }

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/api/sedes/${id}` : `${API_BASE_URL}/api/sedes`;

    try {
        const res = await fetch(url, { method: metodo, headers, body: JSON.stringify(datos) });
        if (res.ok) {
            alert("✅ Sede guardada exitosamente");
            document.getElementById('formSede').reset();
            document.getElementById('s_id').value = '';
            
            const modalEl = document.getElementById('modalSede');
            const modalInst = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();
            
            cargarSedes();
        } else {
            alert("❌ Error al guardar sede.");
        }
    } catch (e) { alert("Error de conexión al guardar sede."); }
}

async function eliminarSede(id) {
    if (!confirm("⚠️ ¿Estás seguro de eliminar esta sede? Esto podría afectar a los alumnos vinculados.")) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes/${id}`, { method: 'DELETE', headers });
        if (res.ok) {
            cargarSedes();
        }
    } catch (e) { alert("Error al eliminar la sede."); }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', cargarSedes);

// Limpiar formulario al cerrar
document.getElementById('modalSede').addEventListener('hidden.bs.modal', function () {
    document.getElementById('formSede').reset();
    document.getElementById('s_id').value = '';
});