require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Inicializar app
const app = express();

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.log(err));


// Configurar middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de Handlebars
const hbs = exphbs.create({ extname: '.handlebars' });
app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

// Sesiones
app.use(session({
  secret: 'secret', // Cambia esto por una cadena secreta única
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Mensajes flash
app.use(flash());

// Variables globales
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Carpeta pública
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
app.use('/messages', messageRoutes);

// Ruta principal de home
app.get('/', (req, res) => {
  res.render('home'); // Renderiza la vista "home.handlebars"
});

// Configurar el puerto y ejecutar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
