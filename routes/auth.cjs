const express = require('express');
const router = express.Router();
const db = require('../config/database.cjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login - Endpoint para iniciar sesión
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error en la base de datos.' });
        }
        if (!user) {
            // Mensaje genérico para no revelar si el usuario existe o no
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Comparar la contraseña proporcionada con el hash almacenado
        const isMatch = bcrypt.compareSync(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Si las credenciales son correctas, crear y firmar un JWT
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role
        };
        
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET no está definida en las variables de entorno.");
            return res.status(500).json({ error: "Error de configuración del servidor." });
        }

        const token = jwt.sign(payload, secret, { expiresIn: '8h' });

        res.json({
            message: 'Inicio de sesión exitoso.',
            token: token
        });
    });
});

module.exports = router;
