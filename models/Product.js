const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definir el esquema del producto
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String, // URL de la imagen del producto
        default: 'default.jpg' // Si no se proporciona, usa una imagen por defecto
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Crear y exportar el modelo
module.exports = mongoose.model('Product', ProductSchema);
