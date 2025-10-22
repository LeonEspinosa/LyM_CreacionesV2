/**
 * Verificación de Seguridad:
 * Este middleware protege las rutas de administración verificando un JSON Web Token (JWT).
 */
const jwt = require('jsonwebtoken');

const protectAdminRoute = (req, res, next) => {
    // 1. Obtener el token del encabezado 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No se proporcionó token." });
    }

    // 2. Verificar el token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT_SECRET no está definida en las variables de entorno.");
        return res.status(500).json({ error: "Error de configuración del servidor." });
    }
    
    jwt.verify(token, secret, (err, user) => {
        if (err) {
            // Si el token es inválido (expirado, malformado, etc.)
            return res.status(403).json({ error: "Token no válido o expirado." });
        }
        
        // 3. Opcional: Verificar rol si es necesario
        if (user.role !== 'admin') {
            return res.status(403).json({ error: "No tienes permisos de administrador." });
        }

        // 4. Si el token es válido, adjuntar el payload del usuario al request y continuar
        req.user = user;
        next();
    });
};

// Exportamos la función para que pueda ser utilizada en los archivos de rutas.
module.exports = {
    protectAdminRoute
};
