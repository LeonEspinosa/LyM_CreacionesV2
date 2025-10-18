const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = "tienda.db";

/**
 * Mantenimiento a Largo Plazo:
 * Esta es la única fuente de verdad para la conexión a la base de datos.
 * Si en el futuro migras a otra base de datos (como PostgreSQL o MySQL),
 * solo necesitarás modificar este archivo, y el resto de la aplicación seguirá funcionando.
 */
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
      console.error("Error al conectar con la base de datos:", err.message);
      throw err;
    } else {
        console.log('Conectado a la base de datos SQLite desde el módulo de configuración.');
        // Habilitar claves foráneas para mantener la integridad de los datos.
        db.get("PRAGMA foreign_keys = ON");
    }
});

// Exportamos la instancia de la base de datos para que otros archivos puedan usarla.
module.exports = db;
