    const express = require('express');
    const router = express.Router();
    const db = require('../config/database.cjs'); // Importamos la conexión a la base de datos
    const { protectAdminRoute } = require('../middleware/auth.cjs'); // Importamos el middleware de seguridad

    // --- RUTAS DE PRODUCTOS ---

    // GET: Obtener todos los productos
    // Verificación de Calidad: La lógica para distinguir una petición de admin y una pública está encapsulada aquí.
    router.get("/", (req, res) => {
        console.log('Rutas de Productos: Recibida petición GET para productos.');
        const is_admin_request = req.query.all === 'true' && req.headers['x-admin-secret']; // Simplificado para la verificación
        const sql = is_admin_request 
            ? `SELECT * FROM products ORDER BY id DESC`
            : `SELECT * FROM products WHERE enabled = 1 ORDER BY id DESC`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Error al obtener productos:', err.message);
                return res.status(500).json({ "error": err.message });
            }
            const products = rows.map(p => ({
                ...p,
                images: JSON.parse(p.images || '[]'),
                category: JSON.parse(p.category || '[]')
            }));
            res.json(products);
        });
    });

    // POST /api/products - Crear un nuevo producto
    router.post("/", protectAdminRoute, (req, res) => {
        // ... (La lógica de creación que ya teníamos en server.js)
        const {
            name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
            discount_percentage, cost_price, currency, taxes, final_price, min_purchase_quantity, max_purchase_quantity, weight,
            dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
        } = req.body;
        
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: "El nombre del producto es inválido." });
        }

        const sql = `INSERT INTO products (
            name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
            discount_percentage, cost_price, currency, taxes, final_price, min_purchase_quantity, max_purchase_quantity, weight,
            dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        
        const params = [
            name, short_description, long_description, JSON.stringify(images || []), video_url, JSON.stringify(category || []), status, enabled ? 1 : 0, stock, base_price, sale_price,
            discount_percentage, cost_price, currency, taxes, final_price, min_purchase_quantity, max_purchase_quantity, weight,
            dimensions, customizable ? 1 : 0, has_production_time ? 1 : 0, production_time_hours, restock_time, featured ? 1 : 0
        ];
        
        db.run(sql, params, function(err) {
            if (err) return res.status(500).json({"error": err.message});
            res.status(201).json({ "message": "Producto creado con éxito", "data": { id: this.lastID, ...req.body } });
        });
    });

    // PUT /api/products/:id - Actualizar un producto
    router.put("/:id", protectAdminRoute, (req, res) => {
        // ... (La lógica de actualización que ya teníamos en server.js)
        const {
            name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
            discount_percentage, cost_price, currency, taxes, final_price, min_purchase_quantity, max_purchase_quantity, weight,
            dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
        } = req.body;

        const sql = `UPDATE products SET 
            name = ?, short_description = ?, long_description = ?, images = ?, video_url = ?, category = ?, status = ?, enabled = ?, stock = ?, base_price = ?, sale_price = ?,
            discount_percentage = ?, cost_price = ?, currency = ?, taxes = ?, final_price = ?, min_purchase_quantity = ?, max_purchase_quantity = ?, weight = ?,
            dimensions = ?, customizable = ?, has_production_time = ?, production_time_hours = ?, restock_time = ?, featured = ?
            WHERE id = ?`;
            
        const params = [
            name, short_description, long_description, JSON.stringify(images || []), video_url, JSON.stringify(category || []), status, enabled ? 1 : 0, stock, base_price, sale_price,
            discount_percentage, cost_price, currency, taxes, final_price, min_purchase_quantity, max_purchase_quantity, weight,
            dimensions, customizable ? 1 : 0, has_production_time ? 1 : 0, production_time_hours, restock_time, featured ? 1 : 0,
            req.params.id
        ];

        db.run(sql, params, function(err) {
            if (err) return res.status(500).json({"error": err.message});
            if (this.changes === 0) return res.status(404).json({ "error": "Producto no encontrado." });
            res.json({ message: `Producto actualizado con éxito` });
        });
    });

    // DELETE /api/products/:id - Eliminar un producto
    router.delete("/:id", protectAdminRoute, (req, res) => {
        // ... (La lógica de eliminación que ya teníamos en server.js)
        db.run('DELETE FROM products WHERE id = ?', req.params.id, function(err) {
            if (err) return res.status(500).json({"error": err.message});
            if (this.changes === 0) return res.status(404).json({ "error": "Producto no encontrado." });
            res.json({ "message": `Producto eliminado`, "changes": this.changes });
        });
    });

    // PATCH /api/products/:id/stock - Actualizar solo el stock
    router.patch("/:id/stock", protectAdminRoute, (req, res) => {
        // ... (La lógica de actualización de stock que ya teníamos en server.js)
        const { change } = req.body;

        if (typeof change !== 'number' || !isFinite(change)) {
            return res.status(400).json({ error: "La cantidad a cambiar debe ser un número." });
        }

        const productId = req.params.id;

        db.get(`SELECT stock FROM products WHERE id = ?`, [productId], (err, product) => {
            if (err) return res.status(500).json({ error: "Error de base de datos al verificar el stock." });
            if (!product) return res.status(404).json({ error: "Producto no encontrado." });
            if (product.stock + change < 0) {
                return res.status(400).json({ error: `No se puede reducir el stock por debajo de cero. Stock actual: ${product.stock}.` });
            }
            
            const sql = `UPDATE products SET stock = stock + ? WHERE id = ?`;
            db.run(sql, [change, productId], function(err) {
                if (err) return res.status(500).json({ error: "Error al actualizar el stock: " + err.message });
                db.get(`SELECT stock FROM products WHERE id = ?`, [productId], (err, row) => {
                    if (err) return res.status(500).json({error: "Stock actualizado, pero no se pudo recuperar el nuevo valor."});
                    res.json({ message: 'Stock actualizado con éxito', newStock: row.stock });
                });
            });
        });
    });

    module.exports = router;
    
