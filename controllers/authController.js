const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Controlador para registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Validaciones básicas
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Por favor, llena todos los campos' });
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
  } else {
    // Verificar si el usuario ya existe
    const user = await User.findOne({ email });
    if (user) {
      errors.push({ msg: 'El correo electrónico ya está registrado' });
      return res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
      // Crear un nuevo usuario
      const newUser = new User({
        name,
        email,
        password
      });

      // Hashear la contraseña con bcrypt antes de guardar
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          // Reemplazar la contraseña con la versión hasheada
          newUser.password = hash;
          // Guardar el nuevo usuario
          await newUser.save();
          req.flash('success_msg', 'Registro exitoso. Ahora puedes iniciar sesión');
          res.redirect('/login');
        });
      });
    }
  }
};

// Controlador para iniciar sesión
exports.loginUser = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
};

// Controlador para cerrar sesión
exports.logoutUser = (req, res) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'Has cerrado sesión');
    res.redirect('/login');
  });
};
