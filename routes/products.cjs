const express = require('express');
const router = express.Router();
const db = require('../config/database.cjs');
const { protectAdminRoute } = require('../middleware/auth.cjs');

/**
 * Helper para calcular precios dinámicamente.
 * Esta función toma un producto de la base de datos y le añade
 * los campos `discount_percentage` y `final_price`.
 */
const calculatePrices = (product) => {
    let discount = 0;
    // Aseguramos que los precios son números antes de calcular
    const basePrice = parseFloat(product.base_price) || 0;
    const salePrice = parseFloat(product.sale_price) || 0;
    const taxes = parseFloat(product.taxes) || 0;

    if (basePrice > 0 && salePrice > 0 && salePrice < basePrice) {
        discount = ((basePrice - salePrice) / basePrice) * 100;
    }
    
    const priceToCalculate = (salePrice > 0 && salePrice < basePrice) ? salePrice : basePrice;
    const finalPrice = priceToCalculate * (1 + taxes / 100);

    return {
        ...product,
        discount_percentage: parseFloat(discount.toFixed(2)),
        final_price: parseFloat(finalPrice.toFixed(2))
    };
};


// GET: Obtener todos los productos
router.get("/", (req, res) => {
    const is_admin_request = req.query.all === 'true' && req.headers['x-admin-secret'];
    const sql = is_admin_request 
        ? `SELECT * FROM products ORDER BY id DESC`
        : `SELECT * FROM products WHERE enabled = 1 ORDER BY id DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ "error": err.message });

        // MODIFICADO: Calculamos precios para cada producto antes de enviarlo
        const products = rows.map(p => {
            const productWithParsedJSON = {
                ...p,
                images: JSON.parse(p.images || '[]'),
                category: JSON.parse(p.category || '[]')
            };
            return calculatePrices(productWithParsedJSON);
        });
        res.json(products);
    });
});

// POST /api/products - Crear un nuevo producto (sin campos calculados)
router.post("/", protectAdminRoute, (req, res) => {
    // MODIFICADO: Se quitan discount_percentage y final_price
    const {
        name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
        cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
        dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
    } = req.body;

    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "El nombre del producto es inválido." });
    }

    const sql = `INSERT INTO products (
        name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
        cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
        dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    
    const params = [
        name, short_description, long_description, JSON.stringify(images || []), video_url, JSON.stringify(category || []), status, enabled ? 1 : 0, stock, base_price, sale_price,
        cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
        dimensions, customizable ? 1 : 0, has_production_time ? 1 : 0, production_time_hours, restock_time, featured ? 1 : 0
    ];
    
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({"error": err.message});
        res.status(201).json({ "message": "Producto creado con éxito", "data": { id: this.lastID, ...req.body } });
    });
});

// PUT /api/products/:id - Actualizar un producto (sin campos calculados)
router.put("/:id", protectAdminRoute, (req, res) => {
    // MODIFICADO: Se quitan discount_percentage y final_price
    const {
        name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
        cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
        dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
    } = req.body;

    const sql = `UPDATE products SET 
        name = ?, short_description = ?, long_description = ?, images = ?, video_url = ?, category = ?, status = ?, enabled = ?, stock = ?, base_price = ?, sale_price = ?,
        cost_price = ?, currency = ?, taxes = ?, min_purchase_quantity = ?, max_purchase_quantity = ?, weight = ?,
        dimensions = ?, customizable = ?, has_production_time = ?, production_time_hours = ?, restock_time = ?, featured = ?
        WHERE id = ?`;
        
    const params = [
        name, short_description, long_description, JSON.stringify(images || []), video_url, JSON.stringify(category || []), status, enabled ? 1 : 0, stock, base_price, sale_price,
        cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
        dimensions, customizable ? 1 : 0, has_production_time ? 1 : 0, production_time_hours, restock_time, featured ? 1 : 0,
        req.params.id
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({"error": err.message});
        if (this.changes === 0) return res.status(404).json({ "error": "Producto no encontrado." });
        res.json({ message: `Producto actualizado con éxito` });
    });
});

// Las rutas DELETE y PATCH de stock no necesitan cambios significativos en su lógica principal.
// DELETE /api/products/:id - Eliminar un producto
router.delete("/:id", protectAdminRoute, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({"error": err.message});
        if (this.changes === 0) return res.status(404).json({ "error": "Producto no encontrado." });
        res.json({ "message": `Producto eliminado`, "changes": this.changes });
    });
});

// PATCH /api/products/:id/stock - Actualizar solo el stock
router.patch("/:id/stock", protectAdminRoute, (req, res) => {
    const { change } = req.body;

    if (typeof change !== 'number' || !isFinite(change)) {
        return res.status(400).json({ error: "La cantidad a cambiar debe ser un número." });
    }

    const sql = `UPDATE products SET stock = stock + ? WHERE id = ?`;
    db.run(sql, [change, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: "Error al actualizar el stock: " + err.message });
        
        db.get(`SELECT stock FROM products WHERE id = ?`, [req.params.id], (err, row) => {
            if (err) return res.status(500).json({error: "Stock actualizado, pero no se pudo recuperar el nuevo valor."});
            if (!row) return res.status(404).json({ error: "Producto no encontrado." });
            res.json({ message: 'Stock actualizado con éxito', newStock: row.stock });
        });
    });
});

module.exports = router;

