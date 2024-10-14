const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definir el esquema del carrito
const CartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Referencia al usuario
        required: true
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product', // Referencia al producto
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Actualiza el totalPrice basado en los productos y sus cantidades
CartSchema.methods.updateTotalPrice = async function() {
    let total = 0;
    for (let item of this.items) {
        const product = await mongoose.model('Product').findById(item.product);
        total += product.price * item.quantity;
    }
    this.totalPrice = total;
    return this.save();
};

module.exports = mongoose.model('Cart', CartSchema);
