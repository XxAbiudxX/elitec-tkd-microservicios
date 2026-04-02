const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const email = localStorage.getItem('userEmail');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

let sedesCache = []; // Caché para cruzar IDs numéricos con los Nombres de las sedes

// 1. Cargar las sedes desde el student-service (Necesario para el select y para las tarjetas)
async function cargarSedesParaSelect() {
    const select = document.getElementById('h-sede');
    try {
        const res = await fetch(`${API_BASE_URL}/api/sedes`, { headers });
        if (res.ok) {
            sedesCache = await res.json();
            if (select) {
                select.innerHTML = sedesCache.map(s => {
                    const idReal = s.id || s.idSede;
                    return `<option value="${idReal}">${s.nombre}</option>`;
                }).join('');
            }
        }
    } catch (e) {
        console.error("Error al cargar sedes.");
    }
}

// 2. Cargar el cronograma desde el training-service
async function cargarHorarios() {
    // Obtenemos el rol del localStorage por si window.userRole falla al recargar
    const rol = window.userRole || localStorage.getItem('userRole'); 
    const grid = document.getElementById('horarios-grid');
    
    // Mostramos panel de administrador
    if (rol !== 'ROLE_ALUMNO') {
        document.getElementById('admin-controls').classList.remove('d-none');
    }

    // Aseguramos que las sedes estén en memoria antes de dibujar las tarjetas
    if (sedesCache.length === 0) {
        await cargarSedesParaSelect();
    }

    // Por ahora, todos leen de la misma ruta (hasta que hagamos el filtro por alumno)
    const url = `${API_BASE_URL}/api/horarios`;

    try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        grid.innerHTML = '';

        if (data.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted mt-5">No hay clases programadas para esta semana.</div>';
            return;
        }

        data.forEach(h => {
            // Cruce mágico de datos: Buscamos el nombre de la sede usando su ID
            const sedeAsignada = sedesCache.find(s => (s.id === h.sedeId || s.idSede === h.sedeId));
            const nombreSedeReal = sedeAsignada ? sedeAsignada.nombre : 'Sede desconocida';
            const profeSedeReal = sedeAsignada ? sedeAsignada.encargado : 'Por asignar';
            
            // El backend devuelve 'id'
            const idRealHorario = h.id || h.idHorario;

            // Cortamos los segundos extra para que se vea limpio (18:00 en vez de 18:00:00)
            const horaLimpia = h.horaInicio.substring(0, 5);

            grid.innerHTML += `
                <div class="col-md-4">
                    <div class="card-tkd p-4 border-bottom border-orange border-4 h-100 shadow">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-warning text-dark fw-bold text-uppercase">${h.dia}</span>
                            ${rol !== 'ROLE_ALUMNO' ? `<button class="btn btn-sm text-danger" onclick="borrarHorario(${idRealHorario})"><i class="bi bi-trash"></i></button>` : ''}
                        </div>
                        <h2 class="fw-bold text-white mb-3"><i class="bi bi-clock text-orange"></i> ${horaLimpia}</h2>
                        <div class="bg-dark p-2 rounded mb-2">
                            <p class="mb-1 small text-light"><i class="bi bi-geo-alt text-danger"></i> Sede: ${nombreSedeReal}</p>
                            <p class="mb-0 small text-light"><i class="bi bi-person-badge text-primary"></i> Profe: ${profeSedeReal}</p>
                        </div>
                        ${rol === 'ROLE_ALUMNO' ? `<button class="btn btn-outline-success btn-sm w-100 mt-3 fw-bold" onclick="confirmarAsistenciaHoy(${idRealHorario})"><i class="bi bi-check2-circle"></i> Confirmar Mi Asistencia</button>` : ''}
                    </div>
                </div>`;
        });
    } catch (e) { 
        grid.innerHTML = '<div class="alert alert-danger text-center w-100 mt-4">Error de conexión al cargar el cronograma.</div>'; 
    }
}

// 3. Crear una nueva clase en el training-service
async function crearClase() {
    let hora = document.getElementById('h-hora').value;
    const idSede = document.getElementById('h-sede').value;
    const dia = document.getElementById('h-dia').value;

    if (!hora || !idSede) {
        alert("⚠️ Selecciona una Sede y una Hora para continuar.");
        return;
    }

    // Añadir segundos para que Java no se queje
    if (hora.length === 5) hora += ":00";

    const nuevaClase = {
        sedeId: parseInt(idSede),
        dia: dia,
        horaInicio: hora
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/horarios`, {
            method: 'POST', 
            headers: headers, 
            body: JSON.stringify(nuevaClase)
        });
        
        if (res.ok) {
            alert("✅ ¡Horario publicado en el cronograma!");
            document.getElementById('h-hora').value = '';
            cargarHorarios();
        } else {
            alert("❌ Error al publicar la clase en la nube.");
        }
    } catch (e) { alert("🔌 Error de conexión al crear la clase."); }
}

// 4. Eliminar una clase
async function borrarHorario(id) {
    if (!confirm("⚠️ ¿Seguro que deseas eliminar este horario del cronograma general?")) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/horarios/${id}`, { method: 'DELETE', headers });
        if (res.ok) {
            cargarHorarios();
        } else {
            alert("Error al intentar eliminar.");
        }
    } catch (e) { alert("Error de conexión al eliminar."); }
}

// Función placeholder para la fase de asistencias
function confirmarAsistenciaHoy(idHorario) {
    alert("📍 Módulo de asistencias conectándose... (Fase 2)");
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const rol = window.userRole || localStorage.getItem('userRole');
    
    // Inyectar links de admin en el sidebar de forma limpia
    if (rol !== 'ROLE_ALUMNO') {
        const nav = document.getElementById('nav-container');
        if (nav) {
            nav.innerHTML = `
                <a class="nav-link" href="dashboard.html"><i class="bi bi-speedometer2"></i> Inicio</a>
                <a class="nav-link" href="alumnos.html"><i class="bi bi-people"></i> Gestión Alumnos</a>
                <a class="nav-link" href="sedes.html"><i class="bi bi-geo-alt"></i> Sedes</a>
                <a class="nav-link active" href="horarios.html"><i class="bi bi-calendar3"></i> Mis Horarios</a>
                <a class="nav-link text-warning" href="perfil.html"><i class="bi bi-person-circle"></i> Mi Perfil</a>
            `;
        }
    }
    cargarHorarios();
});