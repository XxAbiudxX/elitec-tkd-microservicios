const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-table-body');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth/usuarios`, { headers });
        
        if (res.ok) {
            const usuarios = await res.json();
            tbody.innerHTML = '';
            
            usuarios.forEach(u => {
                // CORRECCIÓN: Leemos u.roles[0].nombre (que traerá "ADMIN", "PROFESOR" o "ALUMNO")
                let rolActual = (u.roles && u.roles.length > 0 && u.roles[0].nombre) 
                                ? u.roles[0].nombre 
                                : 'ALUMNO';
                
                // Le damos colores distintivos a cada rol
                let badgeClass = 'bg-primary'; // Azul para Alumno
                if (rolActual === 'ADMIN') badgeClass = 'bg-danger'; // Rojo para Admin
                if (rolActual === 'PROFESOR') badgeClass = 'bg-warning text-dark'; // Amarillo para Profesor
                
                // Usamos el email por defecto
                let correo = u.email || 'Sin correo';

                tbody.innerHTML += `
                    <tr>
                        <td class="text-muted">#${u.id}</td>
                        <td class="text-white fw-bold">${correo}</td>
                        <td><span class="badge ${badgeClass}">${rolActual}</span></td>
                        <td>
                            <select id="select-rol-${u.id}" class="form-select form-select-sm bg-dark text-white border-secondary">
                                <option value="ALUMNO" ${rolActual === 'ALUMNO' ? 'selected' : ''}>Alumno</option>
                                <option value="PROFESOR" ${rolActual === 'PROFESOR' ? 'selected' : ''}>Profesor</option>
                                <option value="ADMIN" ${rolActual === 'ADMIN' ? 'selected' : ''}>Administrador</option>
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
        const res = await fetch(`${API_BASE_URL}/api/auth/usuarios/${usuarioId}/rol`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ rol: nuevoRol }) // Mandamos directamente "ADMIN", "ALUMNO" o "PROFESOR"
        });

        if (res.ok) {
            alert("✅ Rol actualizado correctamente.");
            cargarUsuarios(); // Recargamos la tabla para ver el cambio inmediato
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