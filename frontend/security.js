// security.js
(function() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Decodificar el JWT para saber quién es
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    const rol = payload.role || payload.authorities || 'ROLE_ALUMNO';
    
    // Guardar el rol globalmente para usarlo en la UI
    window.userRole = rol;

    // Lógica de redirección por intentos de acceso no autorizados
    const path = window.location.pathname;
    if (rol === 'ROLE_ALUMNO' && (path.includes('alumnos.html') || path.includes('sedes.html'))) {
        console.warn("⚠️ Intento de acceso no autorizado detectado.");
        window.location.href = 'dashboard.html';
    }
})();