    const express = require('express');
    const router = express.Router();
    const db = require('../config/database.cjs');
    const { protectAdminRoute } = require('../middleware/auth.cjs');

    // --- RUTAS DE PEDIDOS ---

    // POST /api/orders - Crear un nuevo pedido (Ruta Pública)
    router.post('/', async (req, res) => {
        // ... (La lógica de creación de pedidos que ya teníamos en server.js)
        const { cart, shippingInfo } = req.body;

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío o no es válido." });
        }
        
        try {
            const productIds = cart.map(item => item.id);
            const placeholders = productIds.map(() => '?').join(',');
            
            db.all(`SELECT id, base_price, sale_price, taxes FROM products WHERE id IN (${placeholders})`, productIds, (err, productsFromDB) => {
                if (err) return res.status(500).json({ error: "Error de base de datos al verificar productos." });

                let itemsSubtotal = 0;
                let totalTaxes = 0;
                const orderItemsData = [];

                for (const item of cart) {
                    const product = productsFromDB.find(p => p.id === item.id);
                    if (!product) return res.status(400).json({ error: `Producto con ID ${item.id} no encontrado.` });

                    const unit_price = product.sale_price || product.base_price;
                    const discount_applied = product.sale_price ? (product.base_price - product.sale_price) * item.quantity : 0;
                    const item_subtotal = item.quantity * unit_price;
                    const item_taxes = item_subtotal * (product.taxes / 100);

                    itemsSubtotal += item_subtotal;
                    totalTaxes += item_taxes;
                    
                    orderItemsData.push({
                        product_id: item.id,
                        quantity: item.quantity,
                        unit_price: unit_price,
                        discount_applied: discount_applied,
                        item_subtotal: item_subtotal
                    });
                }

                const shipping_cost = shippingInfo.pickupAtStore ? 0 : (req.app.locals.shippingZones[shippingInfo.zip] || 0);
                const total_amount = itemsSubtotal + shipping_cost + totalTaxes;
                
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');

                    const { firstName, lastName, contactNumber, address, city, zip, deliveryDate, pickupAtStore } = shippingInfo;
                    const now = new Date().toISOString();
                    const insertOrderSql = `INSERT INTO orders (
                        customer_firstName, customer_lastName, customer_phone, shipping_address, shipping_city, shipping_zip, 
                        shipping_cost, taxes, total_amount, currency, shipping_status, order_date, update_date, delivery_date, pickup_at_store
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    
                    const orderParams = [
                        firstName, lastName, contactNumber, address, city, zip,
                        shipping_cost, totalTaxes, total_amount, 'ARS', 'preparando', now, now, deliveryDate, pickupAtStore ? 1 : 0
                    ];

                    db.run(insertOrderSql, orderParams, function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: "Error al guardar el pedido: " + err.message });
                        }
                        
                        const orderId = this.lastID;
                        const insertItemSql = `INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount_applied, item_subtotal) VALUES (?, ?, ?, ?, ?, ?)`;
                        const stmt = db.prepare(insertItemSql);

                        for (const itemData of orderItemsData) {
                            stmt.run(orderId, itemData.product_id, itemData.quantity, itemData.unit_price, itemData.discount_applied, itemData.item_subtotal);
                        }

                        stmt.finalize((err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: "Error al guardar los items del pedido: " + err.message });
                            }
                            db.run('COMMIT');
                            res.status(201).json({ message: "Pedido creado con éxito", orderId: orderId });
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
        // ... (La lógica de obtención de pedidos que ya teníamos en server.js)
        const ordersSql = `SELECT * FROM orders ORDER BY order_date DESC`;
        
        db.all(ordersSql, [], (err, orders) => {
            if (err) return res.status(500).json({ "error": err.message });
            
            const itemsSql = `
                SELECT oi.*, p.name as productName 
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
            `;
            
            db.all(itemsSql, [], (err, items) => {
                if (err) return res.status(500).json({ "error": "Error al obtener los detalles del pedido." });
                
                const ordersWithItems = orders.map(order => ({
                    ...order,
                    items: items.filter(item => item.order_id === order.id)
                }));
                
                res.json(ordersWithItems);
            });
        });
    });

    module.exports = router;
    
