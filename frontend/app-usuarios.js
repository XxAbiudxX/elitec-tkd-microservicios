const API_BASE_URL = "https://gateway-service-production-2ae6.up.railway.app";
const token = localStorage.getItem('jwtToken');
const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-table-body');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="spinner-border text-danger"></div></td></tr>';

    try {
        // Suponiendo que tu auth-service tiene un endpoint para listar usuarios
        const res = await fetch(`${API_BASE_URL}/api/auth/usuarios`, { headers });
        if (!res.ok) throw new Error("Error al obtener usuarios");
        
        const usuarios = await res.json();
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            // Extraer el rol principal
            const rolActual = u.rol || 'ROLE_ALUMNO';
            
            tbody.innerHTML += `
                <tr>
                    <td class="align-middle">${u.nombre || 'N/A'} ${u.apellido || ''}</td>
                    <td class="align-middle">${u.email}</td>
                    <td class="align-middle">
                        <span class="badge ${rolActual.includes('ADMIN') ? 'bg-danger' : rolActual.includes('PROFESOR') ? 'bg-primary' : 'bg-secondary'}">
                            ${rolActual.replace('ROLE_', '')}
                        </span>
                    </td>
                    <td class="align-middle">
                        <select class="form-select form-select-sm bg-dark text-white border-secondary d-inline-block w-auto" 
                                onchange="cambiarRol('${u.email}', this.value)">
                            <option value="" selected disabled>Cambiar a...</option>
                            <option value="ROLE_ADMIN">Administrador</option>
                            <option value="ROLE_PROFESOR">Profesor</option>
                            <option value="ROLE_ALUMNO">Alumno</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: Asegúrate de que el endpoint /api/auth/usuarios exista en tu backend.</td></tr>`;
    }
}

async function cambiarRol(email, nuevoRol) {
    if(!confirm(`¿Seguro que deseas cambiar el rol de ${email} a ${nuevoRol.replace('ROLE_', '')}?`)) return;

    try {
        // Suponiendo que tienes un endpoint para actualizar el rol
        const res = await fetch(`${API_BASE_URL}/api/auth/usuarios/rol`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ email: email, rol: nuevoRol })
        });

        if (res.ok) {
            alert("✅ Rol actualizado en la base de datos.");
            cargarUsuarios(); // Recargar la tabla
        } else {
            alert("❌ No se pudo actualizar el rol.");
        }
    } catch (e) {
        alert("Error de conexión al intentar cambiar el rol.");
    }
}

document.addEventListener('DOMContentLoaded', cargarUsuarios);