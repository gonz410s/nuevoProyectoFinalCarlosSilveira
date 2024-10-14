const express = require('express');
const { body, validationResult } = require('express-validator'); // Importa express-validator
const Product = require('../models/Product'); // Asegúrate de que este modelo exista
const { ensureAuthenticated } = require('../config/auth'); // Asegúrate de que este archivo exista
const { verificarToken } = require('../config/auth');
const router = express.Router();

// Ruta para mostrar todos los productos (paginados)
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página actual
    const limit = 10; // Productos por página
    const skip = (page - 1) * limit; // Saltar productos para la paginación

    try {
        const products = await Product.find().skip(skip).limit(limit);
        const count = await Product.countDocuments();
        const totalPages = Math.ceil(count / limit);

        res.render('products', {
            products,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener productos');
    }
});

// Ruta para mostrar el formulario de agregar un nuevo producto (solo admin)
router.get('/add', ensureAuthenticated, (req, res) => {
    if (req.user.role !== 'admin') {
        req.flash('error_msg', 'No tienes permiso para agregar productos');
        return res.redirect('/auth/login');
    }
    res.render('addProduct'); // Renderiza la vista "addProduct.handlebars"
});

// Ruta para manejar la adición de nuevos productos (solo admin)
router.post('/add', 
    ensureAuthenticated, 
    [
        body('name').notEmpty().withMessage('El nombre es requerido.'),
        body('price').isNumeric().withMessage('El precio debe ser un número.'),
        body('description').optional().notEmpty().withMessage('La descripción no puede estar vacía.'),
        body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.'),
        body('category').notEmpty().withMessage('La categoría es requerida.'),
        body('imageUrl').optional().isURL().withMessage('La URL de la imagen no es válida.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error_msg', error.msg);
            });
            return res.redirect('/products/add');
        }

        const { name, price, description, stock, category, imageUrl } = req.body;

        const newProduct = new Product({
            name,
            price,
            description,
            stock,
            category,
            imageUrl
        });

        try {
            await newProduct.save();
            req.flash('success_msg', 'Producto agregado exitosamente');
            res.redirect('/products');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error al agregar el producto');
            res.redirect('/products/add');
        }
    }
);

// Ruta para mostrar el formulario de edición de un producto (solo admin)
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    if (req.user.role !== 'admin') {
        req.flash('error_msg', 'No tienes permiso para editar productos');
        return res.redirect('/auth/login');
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Producto no encontrado');
            return res.redirect('/products');
        }
        res.render('editProduct', { product }); // Renderiza la vista "editProduct.handlebars"
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener el producto');
    }
});

// Ruta para manejar la actualización de un producto (solo admin)
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
    if (req.user.role !== 'admin') {
        req.flash('error_msg', 'No tienes permiso para editar productos');
        return res.redirect('/auth/login');
    }

    const { name, price, description, stock, category, imageUrl } = req.body;

    try {
        await Product.findByIdAndUpdate(req.params.id, {
            name,
            price,
            description,
            stock,
            category,
            imageUrl
        });
        req.flash('success_msg', 'Producto actualizado exitosamente');
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error al actualizar el producto');
        res.redirect(`/products/edit/${req.params.id}`);
    }
});

// Ruta para manejar la eliminación de un producto (solo admin)
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
    if (req.user.role !== 'admin') {
        req.flash('error_msg', 'No tienes permiso para eliminar productos');
        return res.redirect('/auth/login');
    }

    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Producto eliminado exitosamente');
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error al eliminar el producto');
        res.redirect('/products');
    }
});

module.exports = router;
