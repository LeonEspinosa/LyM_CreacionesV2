const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = "tienda.db";

const setupDatabase = () => {
    const db = new sqlite3.Database(DB_SOURCE, (err) => {
        if (err) return console.error("Error al abrir la base de datos:", err.message);
        console.log('Conectado a la base de datos para la configuración.');
        runSetup(db);
    });
};

const runSetup = (db) => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) return console.error("No se pudo iniciar la transacción:", err.message);
        });

        console.log("Limpiando base de datos antigua...");
        db.run('DROP TABLE IF EXISTS order_items');
        db.run('DROP TABLE IF EXISTS orders');
        db.run('DROP TABLE IF EXISTS products');
        db.run('DROP TABLE IF EXISTS shipping_zones'); // Limpiar la nueva tabla también

        console.log("Creando nueva estructura de tablas...");
        
        db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            short_description TEXT,
            long_description TEXT,
            images TEXT,
            video_url TEXT,
            category TEXT,
            status TEXT DEFAULT 'activo',
            enabled INTEGER NOT NULL DEFAULT 1,
            stock INTEGER NOT NULL DEFAULT 0,
            base_price REAL NOT NULL DEFAULT 0,
            sale_price REAL,
            cost_price REAL,
            currency TEXT DEFAULT 'ARS',
            taxes REAL DEFAULT 21,
            min_purchase_quantity INTEGER DEFAULT 1,
            max_purchase_quantity INTEGER,
            weight REAL,
            dimensions TEXT,
            customizable INTEGER NOT NULL DEFAULT 0,
            has_production_time INTEGER NOT NULL DEFAULT 0,
            production_time_hours INTEGER,
            restock_time INTEGER,
            featured INTEGER NOT NULL DEFAULT 0
        )`);

        db.run(`CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_firstName TEXT NOT NULL,
            customer_lastName TEXT NOT NULL,
            customer_dni TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT,
            shipping_address TEXT,
            shipping_city TEXT,
            shipping_zip TEXT,
            subtotal_amount REAL NOT NULL,
            shipping_cost REAL DEFAULT 0,
            taxes REAL DEFAULT 0,
            total_amount REAL NOT NULL,
            currency TEXT DEFAULT 'ARS',
            payment_method TEXT,
            payment_status TEXT DEFAULT 'pendiente',
            order_status TEXT DEFAULT 'pendiente',
            shipping_status TEXT DEFAULT 'preparando',
            order_date TEXT NOT NULL,
            update_date TEXT,
            delivery_date TEXT NOT NULL,
            pickup_at_store INTEGER NOT NULL DEFAULT 0
        )`);

        db.run(`CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            discount_applied REAL DEFAULT 0,
            item_subtotal REAL NOT NULL,
            is_customized INTEGER DEFAULT 0,
            custom_detail TEXT,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
        )`);
        
        // --- NUEVA TABLA DE ZONAS DE ENVÍO ---
        db.run(`CREATE TABLE shipping_zones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            zone_name TEXT NOT NULL,
            postal_code_start INTEGER NOT NULL,
            postal_code_end INTEGER NOT NULL,
            province TEXT,
            base_cost REAL NOT NULL,
            cost_per_kg REAL DEFAULT 0,
            estimated_days INTEGER DEFAULT 3,
            carrier TEXT DEFAULT 'local',
            free_delivery INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1
        )`);

        console.log("Estructura de tablas creada con éxito.");

        // --- Insertar productos de ejemplo (sin cambios) ---
        const products = [
            { name: "Taza Personalizada 'Tu Momento'", short_description: "Taza de cerámica personalizable, ideal para regalos.", long_description: "Una taza de cerámica de alta calidad de 11oz que puedes personalizar con tu nombre, una frase o un diseño especial. Apta para microondas y lavavajillas. El regalo perfecto para cualquier ocasión.", images: '["taza1.jpg"]', video_url: "", category: '["Regalos", "Cocina"]', status: 'activo', enabled: 1, stock: 5, base_price: 1999.99, sale_price: 1799.99, cost_price: 800, currency: 'ARS', taxes: 21, min_purchase_quantity: 1, max_purchase_quantity: 50, weight: 0.35, dimensions: '8x12x9.5 cm', customizable: 1, has_production_time: 1, production_time_hours: 24, restock_time: 3, featured: 1 },
            { name: "Vela Aromática 'Sueño de Lavanda'", short_description: "Vela de cera de soja con esencia de lavanda.", long_description: "Relajante vela de cera de soja 100% natural con esencia pura de lavanda, ideal para crear un ambiente de paz y tranquilidad. Duración de 40 horas. Envase de vidrio reutilizable.", images: '["vela1.jpg","vela2.jpg"]', video_url: "https://www.youtube.com/watch?v=VIDEO_ID_1", category: '["Hogar", "Velas", "Bienestar"]', status: 'activo', enabled: 1, stock: 15, base_price: 2499.00, sale_price: null, cost_price: 1200, currency: 'ARS', taxes: 21, min_purchase_quantity: 1, max_purchase_quantity: 10, weight: 0.5, dimensions: '9x8x8 cm', customizable: 0, has_production_time: 0, production_time_hours: null, restock_time: 7, featured: 1 }
        ];

        const productStmt = db.prepare(`INSERT INTO products (name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price, cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight, dimensions, customizable, has_production_time, production_time_hours, restock_time, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
        products.forEach(p => productStmt.run(p.name, p.short_description, p.long_description, p.images, p.video_url, p.category, p.status, p.enabled, p.stock, p.base_price, p.sale_price, p.cost_price, p.currency, p.taxes, p.min_purchase_quantity, p.max_purchase_quantity, p.weight, p.dimensions, p.customizable, p.has_production_time, p.production_time_hours, p.restock_time, p.featured));
        productStmt.finalize();
        console.log(`${products.length} productos de ejemplo insertados.`);

        // --- NUEVO: Insertar zonas de envío de ejemplo ---
        const zones = [
            { name: 'Jujuy Local', start: 4600, end: 4618, province: 'Jujuy', cost: 500, days: 1 },
            { name: 'Salta Capital', start: 4400, end: 4400, province: 'Salta', cost: 1200, days: 2 },
            { name: 'Tucumán Capital', start: 4000, end: 4000, province: 'Tucumán', cost: 1500, days: 3 },
            { name: 'CABA', start: 1000, end: 1499, province: 'CABA', cost: 2500, days: 5 }
        ];
        
        const zoneStmt = db.prepare(`INSERT INTO shipping_zones (zone_name, postal_code_start, postal_code_end, province, base_cost, estimated_days) VALUES (?, ?, ?, ?, ?, ?)`);
        zones.forEach(z => zoneStmt.run(z.name, z.start, z.end, z.province, z.cost, z.days));
        zoneStmt.finalize();
        console.log(`${zones.length} zonas de envío de ejemplo insertadas.`);

        db.run('COMMIT', (err) => {
            if (err) {
                console.error("Error al hacer COMMIT de la transacción:", err.message);
                db.run('ROLLBACK');
            } else {
                console.log("Transacción completada exitosamente.");
            }
            db.close((err) => {
                if (err) return console.error("Error al cerrar la base de datos:", err.message);
                console.log('Configuración finalizada. Conexión a la base de datos cerrada.');
            });
        });
    });
};

setupDatabase();

