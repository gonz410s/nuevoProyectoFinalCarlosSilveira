const jwt = require('jsonwebtoken');

// Middleware para asegurar que el usuario está autenticado
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { // Este es el método que debe estar disponible, asegura que lo hayas configurado
        return next();
    }
    req.flash('error_msg', 'Por favor, inicia sesión para acceder a esta página');
    res.redirect('/login');
}

// Middleware para verificar que el usuario es administrador
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') { // Asegúrate de que isAuthenticated esté bien implementado
        return next();
    }
    req.flash('error_msg', 'Acceso denegado, privilegios de administrador requeridos');
    res.redirect('/');
}

// Función para generar un token JWT
function generarToken(usuario) {
    return jwt.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Puedes ajustar el tiempo de expiración según lo desees
    });
}

// Middleware para verificar el token JWT
function verificarToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Usando optional chaining para evitar errores

    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // Almacena el usuario verificado en req
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token no válido' });
    }
}

// Exportar todos los middleware y funciones
module.exports = {
    ensureAuthenticated,
    isAdmin,
    generarToken,
    verificarToken
};
