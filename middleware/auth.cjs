/**
 * Verificación de Seguridad:
 * Este archivo centraliza la lógica de autenticación. La clave secreta se define aquí
 * y no se expone en otros lugares.
 */
const ADMIN_SECRET_KEY = "tu-clave-secreta-aqui";

const protectAdminRoute = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    if (secret !== ADMIN_SECRET_KEY) {
        console.warn('Intento de acceso no autorizado a ruta de admin. Secreto proporcionado:', secret);
        return res.status(403).json({ error: "Acceso no autorizado." });
    }
    // Si la clave es correcta, permite que la petición continúe.
    next();
};

// Exportamos la función para que pueda ser utilizada en los archivos de rutas.
module.exports = {
    protectAdminRoute
};
