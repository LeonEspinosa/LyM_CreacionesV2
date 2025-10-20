const express = require('express');
const router = express.Router();
const db = require('../config/database.cjs');
const { protectAdminRoute } = require('../middleware/auth.cjs');

// Función auxiliar para obtener detalles de un producto (promisificada)
function getProductDetails(productId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT stock, has_production_time, production_time_hours FROM products WHERE id = ?`;
        db.get(sql, [productId], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
}

// Endpoint para calcular el costo de envío Y/O la fecha de entrega estimada.
router.post('/calculate', async (req, res) => {
    const { postalCode, cart, isPickup } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
    }

    try {
        // 1. Calcular el tiempo total de producción requerido
        let totalProductionHours = 0;
        for (const item of cart) {
            const product = await getProductDetails(item.id);
            if (product && product.has_production_time && product.production_time_hours > 0) {
                // Solo se calcula el tiempo para los items que NO están en stock
                const itemsToProduce = Math.max(0, item.quantity - product.stock);
                if (itemsToProduce > 0) {
                    totalProductionHours += itemsToProduce * product.production_time_hours;
                }
            }
        }
        const productionDays = Math.ceil(totalProductionHours / 24);

        // 2. Si es retiro, devolvemos la fecha basada solo en producción.
        if (isPickup) {
            const minimumDeliveryDate = new Date();
            minimumDeliveryDate.setDate(minimumDeliveryDate.getDate() + productionDays);
            return res.json({
                shippingCost: 0,
                minimumDeliveryDate: minimumDeliveryDate.toISOString().split('T')[0]
            });
        }
        
        // 3. Si es envío, buscamos la zona y calculamos todo.
        if (!postalCode) {
            return res.status(400).json({ error: "Falta el código postal para el envío." });
        }
        const postalCodeNumber = parseInt(postalCode, 10);
        if (isNaN(postalCodeNumber)) {
            return res.status(400).json({ error: "El código postal es inválido." });
        }

        const zoneSql = `SELECT base_cost, estimated_days FROM shipping_zones WHERE ? BETWEEN postal_code_start AND postal_code_end AND active = 1`;
        db.get(zoneSql, [postalCodeNumber], (err, zone) => {
            if (err) return res.status(500).json({ error: "Error en la base de datos." });
            if (!zone) return res.status(404).json({ error: "No hacemos envíos a esta zona." });
            
            const shippingDays = zone.estimated_days || 0;
            const totalDaysToWait = productionDays + shippingDays;
            const minimumDeliveryDate = new Date();
            minimumDeliveryDate.setDate(minimumDeliveryDate.getDate() + totalDaysToWait);

            res.json({
                shippingCost: zone.base_cost,
                minimumDeliveryDate: minimumDeliveryDate.toISOString().split('T')[0]
            });
        });
    } catch (error) {
        console.error("Error en /calculate:", error);
        res.status(500).json({ error: "Error al calcular el envío." });
    }
});


// --- RUTAS DE ADMINISTRACIÓN (CRUD) ---
// (El resto de las rutas GET, POST, PUT, DELETE para gestionar zonas se mantienen igual)
// GET /api/shipping - Obtener todas las zonas de envío
router.get('/', protectAdminRoute, (req, res) => {
    db.all('SELECT * FROM shipping_zones ORDER BY province, zone_name', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/shipping - Crear una nueva zona de envío
router.post('/', protectAdminRoute, (req, res) => {
    const { zone_name, postal_code_start, postal_code_end, province, base_cost, cost_per_kg, estimated_days, carrier, active } = req.body;
    if (!zone_name || !base_cost) return res.status(400).json({ error: "El nombre de la zona y el costo base son requeridos." });

    const sql = `INSERT INTO shipping_zones (zone_name, postal_code_start, postal_code_end, province, base_cost, cost_per_kg, estimated_days, carrier, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [zone_name, postal_code_start, postal_code_end, province, base_cost, cost_per_kg, estimated_days, carrier, active ? 1 : 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Zona de envío creada con éxito." });
    });
});

// PUT /api/shipping/:id - Actualizar una zona de envío
router.put('/:id', protectAdminRoute, (req, res) => {
    const { zone_name, postal_code_start, postal_code_end, province, base_cost, cost_per_kg, estimated_days, carrier, active } = req.body;
    const sql = `UPDATE shipping_zones SET
                    zone_name = ?, postal_code_start = ?, postal_code_end = ?, province = ?, base_cost = ?, 
                    cost_per_kg = ?, estimated_days = ?, carrier = ?, active = ?
                 WHERE id = ?`;
    db.run(sql, [zone_name, postal_code_start, postal_code_end, province, base_cost, cost_per_kg, estimated_days, carrier, active ? 1 : 0, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Zona de envío no encontrada." });
        res.json({ message: "Zona de envío actualizada con éxito." });
    });
});

// DELETE /api/shipping/:id - Eliminar una zona de envío
router.delete('/:id', protectAdminRoute, (req, res) => {
    db.run('DELETE FROM shipping_zones WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Zona de envío no encontrada." });
        res.json({ message: "Zona de envío eliminada con éxito." });
    });
});


module.exports = router;

