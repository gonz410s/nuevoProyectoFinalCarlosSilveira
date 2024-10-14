const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ensureAuthenticated } = require('../config/auth');
const { verificarToken } = require('../config/auth');
const router = express.Router();

// Ruta para ver el carrito de un usuario
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
            await cart.save();
        }

        res.render('cart', { cart });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener el carrito');
    }
});

// Ruta para agregar un producto al carrito
router.post('/add/:productId', ensureAuthenticated, async (req, res) => {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }

        // Verifica si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            // Si el producto ya está en el carrito, actualiza la cantidad
            existingItem.quantity += quantity;
        } else {
            // Si no está en el carrito, agrégalo
            cart.items.push({
                product: productId,
                quantity
            });
        }

        await cart.updateTotalPrice();
        req.flash('success_msg', 'Producto agregado al carrito');
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error al agregar el producto al carrito');
        res.redirect('/products');
    }
});

// Ruta para actualizar la cantidad de un producto en el carrito
router.post('/update/:productId', ensureAuthenticated, async (req, res) => {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity);

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            req.flash('error_msg', 'No se encontró el carrito');
            return res.redirect('/cart');
        }

        const item = cart.items.find(item => item.product.toString() === productId);

        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                // Si la cantidad es 0 o menos, eliminar el producto del carrito
                cart.items = cart.items.filter(item => item.product.toString() !== productId);
            }
            await cart.updateTotalPrice();
            req.flash('success_msg', 'Cantidad actualizada');
        } else {
            req.flash('error_msg', 'Producto no encontrado en el carrito');
        }

        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error al actualizar el carrito');
        res.redirect('/cart');
    }
});

// Ruta para eliminar un producto del carrito
router.get('/remove/:productId', ensureAuthenticated, async (req, res) => {
    const productId = req.params.productId;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            req.flash('error_msg', 'No se encontró el carrito');
            return res.redirect('/cart');
        }

        // Eliminar el producto del carrito
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.updateTotalPrice();
        
        req.flash('success_msg', 'Producto eliminado del carrito');
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error al eliminar el producto del carrito');
        res.redirect('/cart');
    }
});

module.exports = router;
