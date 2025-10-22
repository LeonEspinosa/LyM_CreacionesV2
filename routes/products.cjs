const express = require('express');
const router = express.Router();
const db = require('../config/database.cjs');
const { protectAdminRoute } = require('../middleware/auth.cjs');
const { body, validationResult } = require('express-validator'); // 

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

// --- NUEVO: Reglas de validación para la creación de productos ---
// --- ASEGÚRATE DE QUE ESTE BLOQUE ESTÉ ANTES DE router.post ---
const productValidationRules = [
    body('name').trim().notEmpty().withMessage('El nombre del producto es obligatorio.'),
    body('base_price').isFloat({ gt: 0 }).withMessage('El precio base debe ser un número positivo.'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero igual o mayor a 0.'),
    body('enabled').isBoolean().withMessage('El estado "enabled" debe ser verdadero o falso.'),
    // Añade más reglas según necesites para otros campos (ej. sale_price opcional pero numérico si existe)
    body('sale_price').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('El precio de oferta debe ser un número positivo.'),
    body('taxes').optional({ defaults: 21 }).isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo.'),
    body('category').optional().isArray().withMessage('La categoría debe ser un array (puede estar vacío).'),
    body('images').optional().isArray().withMessage('Las imágenes deben ser un array (puede estar vacío).')
];
// --- FIN NUEVO ---

router.post("/",
        protectAdminRoute,
        productValidationRules, // <-- AÑADIR LAS REGLAS AQUÍ
        (req, res) => {
            // --- NUEVO: Verificar errores de validación ---
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Si hay errores, devuelve un 400 con los mensajes
                return res.status(400).json({ errors: errors.array() });
            }
            // --- FIN NUEVO ---

            // MODIFICADO: Se quitan discount_percentage y final_price
            // Extraer los datos validados y sanitizados (express-validator puede hacer sanitización también)
            const { // <-- Usar los datos de req.body aquí sigue estando bien por ahora
                name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
                cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
                dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
            } = req.body;

            // --- CORRECCIÓN: Parseo JSON más seguro ---
            let parsedImages = [];
            let parsedCategories = [];
            try {
                // Asegurarse de que images y category son arrays antes de intentar parsear
                // Si ya vienen como arrays (porque express.json los parseó bien), usarlos directamente.
                // Si vienen como string JSON (menos probable con express.json, pero por seguridad), intentar parsearlos.
                parsedImages = Array.isArray(images) ? images : (images ? JSON.parse(images) : []);
                parsedCategories = Array.isArray(category) ? category : (category ? JSON.parse(category) : []);
                // Validar que realmente sean arrays después del parseo
                if (!Array.isArray(parsedImages)) throw new Error('Images no es un array válido.');
                if (!Array.isArray(parsedCategories)) throw new Error('Category no es un array válido.');
            } catch (parseError) {
                console.error("Error al parsear JSON:", parseError);
                return res.status(400).json({ errors: [{ msg: `Formato inválido para images o category: ${parseError.message}` }] });
            }
            // --- FIN CORRECCIÓN ---


            // La validación básica del nombre que tenías ya no es necesaria aquí, la hace express-validator
            // if (typeof name !== 'string' || name.trim() === '') {
            //    return res.status(400).json({ error: "El nombre del producto es inválido." });
            // }

            const sql = `INSERT INTO products (
                name, short_description, long_description, images, video_url, category, status, enabled, stock, base_price, sale_price,
                cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
                dimensions, customizable, has_production_time, production_time_hours, restock_time, featured
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

            const params = [
                name, short_description, long_description, JSON.stringify(parsedImages), video_url, JSON.stringify(parsedCategories), status, enabled ? 1 : 0, stock, base_price, sale_price,
                cost_price, currency, taxes, min_purchase_quantity, max_purchase_quantity, weight,
                dimensions, customizable ? 1 : 0, has_production_time ? 1 : 0, production_time_hours, restock_time, featured ? 1 : 0
            ];

            db.run(sql, params, function(err) {
                if (err) return res.status(500).json({"error": err.message});
                // Devolver el ID y los datos enviados (ya validados)
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

module.exports = router; // <-- Asegúrate que esto esté al final


