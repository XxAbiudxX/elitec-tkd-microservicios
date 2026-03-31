// security.js - El guardián del Dojo
(function() {
    const token = localStorage.getItem('jwtToken');
    
    // 1. Bloqueo si no hay token
    if (!token) {
        console.warn("Acceso denegado: No se encontró token de sesión.");
        window.location.href = 'login.html';
        return;
    }

    try {
        // 2. Decodificar el JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // 3. Extraer Rol (¡AQUÍ ESTABA EL BUG!)
        // Ahora buscamos 'payload.rol' primero, tal como lo manda tu JwtProvider.java
        let rol = payload.rol || payload.role || payload.roles || payload.authorities || 'ROLE_ALUMNO';
        
        // Si el rol viene como un Array, tomamos el primero
        if (Array.isArray(rol)) {
            rol = rol[0].authority || rol[0];
        }

        // Guardar globalmente para que app-perfil.js y otros lo usen
        window.userRole = rol.toString().toUpperCase();
        console.log("🔐 Seguridad validada. Rol actual:", window.userRole);

        // 4. Lógica de Redirección (Protección de Rutas)
        const path = window.location.pathname;
        const esAlumno = window.userRole.includes('ALUMNO');

        // Páginas prohibidas para Alumnos
        const paginasProtegidas = ['alumnos.html', 'sedes.html', 'usuarios.html'];
        
        const intentaEntrarAProtegida = paginasProtegidas.some(pagina => path.includes(pagina));

        if (esAlumno && intentaEntrarAProtegida) {
            console.error("🚫 Intento de acceso no autorizado a:", path);
            alert("Acceso restringido: Solo para Instructores o Administradores.");
            window.location.href = 'dashboard.html';
        }

    } catch (e) {
        console.error("Error crítico en validación de seguridad:", e);
        localStorage.clear();
        window.location.href = 'login.html';
    }
})();