import { API_BASE_URL, AUTH_TOKEN_KEY } from '../src/config.js'; // Ajusta la ruta según sea necesario

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Redirigir si ya hay un token
    if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        window.location.href = '/admin.html'; // Redirige al panel principal si ya está logueado
        return; // Detiene la ejecución del script si redirige
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = ''; // Limpiar errores previos

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión.');
            }

            // Guardar el token en localStorage
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);

            // Redirigir al panel de administración
            window.location.href = '/admin.html'; // O la página de admin que prefieras como principal

        } catch (error) {
            console.error('Error de inicio de sesión:', error);
            errorMessage.textContent = error.message;
        }
    });
});
