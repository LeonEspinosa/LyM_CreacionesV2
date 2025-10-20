const express = require('express');
const router = express.Router();
const db = require('../config/database.cjs');
const { protectAdminRoute } = require('../middleware/auth.cjs');

// POST /api/orders - Crear un nuevo pedido (Ruta Pública)
router.post('/', (req, res) => {
    const { cart, shippingInfo } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío o no es válido." });
    }
    
    try {
        const productIds = cart.map(item => item.id);
        const placeholders = productIds.map(() => '?').join(',');
        
        const sql = `SELECT id, base_price, sale_price, taxes, stock, has_production_time, production_time_hours FROM products WHERE id IN (${placeholders})`;
        db.all(sql, productIds, (err, productsFromDB) => {
            if (err) return res.status(500).json({ error: "Error de base de datos al verificar productos." });

            let subtotal_amount = 0;
            let totalTaxes = 0;
            const orderItemsData = [];

            for (const item of cart) {
                const product = productsFromDB.find(p => p.id === item.id);
                if (!product) return res.status(400).json({ error: `Producto con ID ${item.id} no encontrado.` });
                
                // Validar que la cantidad pedida no supere el stock si no se produce bajo pedido
                if (!product.has_production_time && item.quantity > product.stock) {
                    return res.status(400).json({ error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` });
                }

                const unit_price = product.sale_price || product.base_price;
                const item_subtotal = item.quantity * unit_price;
                const item_taxes = item_subtotal * (product.taxes / 100);

                subtotal_amount += item_subtotal;
                totalTaxes += item_taxes;
                
                orderItemsData.push({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: unit_price,
                    item_subtotal: item_subtotal,
                    is_customized: item.is_customized || 0,
                    custom_detail: item.custom_detail || null,
                });
            }

            const shipping_cost = shippingInfo.pickupAtStore ? 0 : (shippingInfo.shippingCost || 0);
            const total_amount = subtotal_amount + shipping_cost + totalTaxes;
            
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                const { firstName, lastName, customer_dni, customer_email, contactNumber, address, city, zip, deliveryDate, pickupAtStore } = shippingInfo;
                const now = new Date().toISOString();
                const insertOrderSql = `INSERT INTO orders (
                    customer_firstName, customer_lastName, customer_dni, customer_email, customer_phone, 
                    shipping_address, shipping_city, shipping_zip, shipping_cost, subtotal_amount, taxes, total_amount, 
                    currency, order_status, payment_status, shipping_status, 
                    order_date, update_date, delivery_date, pickup_at_store
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const orderParams = [
                    firstName, lastName, customer_dni, customer_email, contactNumber,
                    address, city, zip, shipping_cost, subtotal_amount, totalTaxes, total_amount,
                    'ARS', 'pendiente', 'pendiente', 'preparando',
                    now, now, deliveryDate, pickupAtStore ? 1 : 0
                ];

                db.run(insertOrderSql, orderParams, function(err) {
                    if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: "Error al guardar el pedido: " + err.message }); }
                    
                    const orderId = this.lastID;
                    const insertItemSql = `INSERT INTO order_items (order_id, product_id, quantity, unit_price, item_subtotal, is_customized, custom_detail) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    const stmt = db.prepare(insertItemSql);
                    for (const itemData of orderItemsData) {
                        stmt.run(orderId, itemData.product_id, itemData.quantity, itemData.unit_price, itemData.item_subtotal, itemData.is_customized, itemData.custom_detail);
                    }

                    stmt.finalize(async (err) => {
                        if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: "Error al guardar items: " + err.message }); }

                        // --- INICIO: LÓGICA DE DEDUCCIÓN DE STOCK CORREGIDA ---
                        try {
                            for (const item of cart) {
                                const product = productsFromDB.find(p => p.id === item.id);
                                // Se deduce del stock la cantidad que ya estaba disponible
                                const stockToDeduct = Math.min(item.quantity, product.stock);
                                if (stockToDeduct > 0) {
                                    await new Promise((resolve, reject) => {
                                        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [stockToDeduct, item.id], (err) => {
                                            if (err) reject(err);
                                            else resolve();
                                        });
                                    });
                                }
                            }
                            db.run('COMMIT');
                            res.status(201).json({ message: "Pedido creado con éxito", orderId: orderId });
                        } catch (stockError) {
                            db.run('ROLLBACK');
                            res.status(500).json({ error: "Error al actualizar el stock: " + stockError.message });
                        }
                        // --- FIN: LÓGICA DE DEDUCCIÓN DE STOCK ---
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: "Un error inesperado ocurrió." });
    }
});

// GET /api/orders - Obtener todos los pedidos (Ruta Protegida)
router.get("/", protectAdminRoute, (req, res) => {
    // ... (sin cambios)
    const ordersSql = `SELECT * FROM orders ORDER BY order_date DESC`;
    db.all(ordersSql, [], (err, orders) => {
        if (err) return res.status(500).json({ "error": err.message });
        const itemsSql = `SELECT oi.*, p.name as productName FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id`;
        db.all(itemsSql, [], (err, items) => {
            if (err) return res.status(500).json({ "error": "Error al obtener los detalles del pedido." });
            const ordersWithItems = orders.map(order => ({ ...order, items: items.filter(item => item.order_id === order.id) }));
            res.json(ordersWithItems);
        });
    });
});

// PATCH /api/orders/:id/status - Actualización rápida de estado
router.patch('/:id/status', protectAdminRoute, (req, res) => {
    // ... (sin cambios)
    const { order_status } = req.body;
    const validStatuses = ['pendiente', 'confirmado', 'en proceso', 'entregado', 'cancelado'];
    if (!order_status || !validStatuses.includes(order_status)) {
        return res.status(400).json({ error: 'Estado de pedido no válido.' });
    }
    const sql = `UPDATE orders SET order_status = ?, update_date = ? WHERE id = ?`;
    db.run(sql, [order_status, new Date().toISOString(), req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado.' });
        res.json({ message: 'Estado del pedido actualizado.' });
    });
});

// PUT /api/orders/:id - Actualizar un pedido completo
router.put('/:id', protectAdminRoute, (req, res) => {
    // ... (sin cambios)
    const { customer_firstName, customer_lastName, customer_dni, customer_email, customer_phone, shipping_address, shipping_city, shipping_zip, payment_status, shipping_status } = req.body;
    const sql = `UPDATE orders SET
        customer_firstName = ?, customer_lastName = ?, customer_dni = ?, customer_email = ?, customer_phone = ?,
        shipping_address = ?, shipping_city = ?, shipping_zip = ?,
        payment_status = ?, shipping_status = ?,
        update_date = ?
        WHERE id = ?`;
    const params = [
        customer_firstName, customer_lastName, customer_dni, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_zip,
        payment_status, shipping_status,
        new Date().toISOString(),
        req.params.id
    ];
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado.' });
        res.json({ message: 'Pedido actualizado con éxito.' });
    });
});

// DELETE /api/orders/:id - Eliminar un pedido
router.delete('/:id', protectAdminRoute, (req, res) => {
    // ... (sin cambios)
    db.run('DELETE FROM orders WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado.' });
        res.json({ message: 'Pedido eliminado con éxito.' });
    });
});

module.exports = router;

