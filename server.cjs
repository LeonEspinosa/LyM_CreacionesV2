    const express = require('express');
    const cors = require('cors');
    const path = require('path');
    const multer = require('multer');

    // MODIFICADO: Ahora importamos los archivos .cjs
    const productRoutes = require('./routes/products.cjs');
    const orderRoutes = require('./routes/orders.cjs');
    const { protectAdminRoute } = require('./middleware/auth.cjs');

    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.locals.shippingZones = {'1401': 500, '1425': 550, '1636': 800, '1870': 900};

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    });
    const upload = multer({ storage: storage });

    // Las rutas ahora apuntan a los módulos CommonJS
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);

    app.post('/api/upload', protectAdminRoute, upload.array('images', 5), (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se subieron archivos.' });
        }
        const filenames = req.files.map(file => file.filename);
        res.status(201).json({ message: 'Imágenes subidas con éxito', filenames: filenames });
    });

    app.use((err, req, res, next) => {
        console.error('Ha ocurrido un error no controlado:', err.stack);
        res.status(500).send('¡Algo salió mal en el servidor!');
    });

    app.listen(port, () => console.log(`Servidor escuchando en http://localhost:${port}`));
    
