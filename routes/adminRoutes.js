const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { ensureAuthenticated, isAdmin, verificarToken } = require('../config/auth');

// Ruta para el dashboard del administrador
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard'); // Renderiza la vista del dashboard de admin
});

// Ruta para agregar un nuevo producto
router.post('/products/add', isAdmin, async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const newProduct = new Product({ name, price, description });
        await newProduct.save();
        req.flash('success_msg', 'Producto agregado exitosamente');
        res.redirect('/admin/dashboard');
    } catch (err) {
        req.flash('error_msg', 'Error al agregar producto');
        res.redirect('/admin/dashboard');
    }
});

// Ruta para ver todos los usuarios
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/users', { users });
    } catch (err) {
        req.flash('error_msg', 'Error al cargar usuarios');
        res.redirect('/admin/dashboard');
    }
});

// Ruta para eliminar un usuario
router.delete('/users/delete/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Usuario eliminado correctamente');
        res.redirect('/admin/users');
    } catch (err) {
        req.flash('error_msg', 'Error al eliminar usuario');
        res.redirect('/admin/users');
    }
});

// Ruta para ver y gestionar carritos
router.get('/carts', isAdmin, async (req, res) => {
    try {
        const carts = await Cart.find().populate('user').populate('products.product');
        res.render('admin/carts', { carts });
    } catch (err) {
        req.flash('error_msg', 'Error al cargar los carritos');
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;
