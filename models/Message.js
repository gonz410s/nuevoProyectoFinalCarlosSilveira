const mongoose = require('mongoose');

// Definir el esquema del mensaje
const mensajeEsquema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Relación con el modelo de Usuario
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now // Por defecto, la fecha de creación es ahora
    }
});

// Crear el modelo
const Message = mongoose.model('Message', mensajeEsquema);

module.exports = Message;
