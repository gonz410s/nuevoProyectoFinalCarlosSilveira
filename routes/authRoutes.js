const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Modelo del usuario
const router = express.Router();
const { verificarToken } = require('../config/auth');

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register'); // Renderiza la vista "register.handlebars"
});

// Ruta para registrar nuevos usuarios
router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Validación básica
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Por favor llena todos los campos' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Las contraseñas no coinciden' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (errors.length > 0) {
        return res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } 

    // Validar si el usuario ya existe
    const user = await User.findOne({ email });
    if (user) {
        errors.push({ msg: 'El correo ya está registrado' });
        return res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } 

    // Crear el nuevo usuario
    const newUser = new User({
        name,
        email,
        password
    });

    // Hashear la contraseña
    try {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
        await newUser.save();
        req.flash('success_msg', 'Estás registrado y ahora puedes iniciar sesión');
        return res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Error al registrar el usuario' });
    }
});

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('login'); // Renderiza la vista "login.handlebars"
});

// Ruta para manejar el login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
        return res.status(400).json({ msg: 'Por favor llena todos los campos' });
    }

    // Buscar el usuario
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Generar el token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Retornar el token al cliente
    res.json({ token });
});

// Ruta para cerrar sesión (opcional, el cierre de sesión en JWT es diferente)
router.get('/logout', (req, res) => {
    // En JWT, el cierre de sesión se maneja del lado del cliente eliminando el token
    req.flash('success_msg', 'Has cerrado sesión correctamente');
    res.redirect('/auth/login');
});

module.exports = router;
