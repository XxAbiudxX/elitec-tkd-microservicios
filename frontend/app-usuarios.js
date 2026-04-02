const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-table-body');
    
    try {
        // Asumimos que tu auth-service responderá a esta ruta
        const res = await fetch(`${API_BASE_URL}/api/auth/usuarios`, { headers });
        
        if (res.ok) {
            const usuarios = await res.json();
            tbody.innerHTML = '';
            
            usuarios.forEach(u => {
                // Mapeamos el rol para que se vea limpio
                let rolActual = u.roles && u.roles.length > 0 ? u.roles[0].rolNombre : 'ROLE_ALUMNO';
                
                tbody.innerHTML += `
                    <tr>
                        <td class="text-muted">#${u.id}</td>
                        <td class="text-white fw-bold">${u.nombreUsuario || u.email}</td>
                        <td><span class="badge ${rolActual === 'ROLE_ADMIN' ? 'bg-danger' : 'bg-primary'}">${rolActual}</span></td>
                        <td>
                            <select id="select-rol-${u.id}" class="form-select form-select-sm bg-dark text-white border-secondary">
                                <option value="ROLE_ALUMNO" ${rolActual === 'ROLE_ALUMNO' ? 'selected' : ''}>Alumno</option>
                                <option value="ROLE_ADMIN" ${rolActual === 'ROLE_ADMIN' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn btn-warning btn-sm fw-bold" onclick="actualizarRol(${u.id})">Guardar</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar usuarios. ¿Tienes permisos?</td></tr>';
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error de conexión con el servidor.</td></tr>';
    }
}

async function actualizarRol(usuarioId) {
    const nuevoRol = document.getElementById(`select-rol-${usuarioId}`).value;
    
    if (!confirm(`¿Seguro que deseas cambiar el rol a ${nuevoRol}?`)) return;

    try {
        // Apuntamos al endpoint de actualización en el auth-service
        const res = await fetch(`${API_BASE_URL}/api/auth/usuarios/${usuarioId}/rol`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ rol: nuevoRol })
        });

        if (res.ok) {
            alert("✅ Rol actualizado correctamente.");
            cargarUsuarios(); // Recargamos la tabla
        } else {
            alert("❌ Error al actualizar el rol. Revisa el backend.");
        }
    } catch (e) {
        alert("🔌 Error de conexión.");
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', cargarUsuarios);