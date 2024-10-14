const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { ensureAuthenticated } = require('../config/auth');

// Ruta para enviar un mensaje
router.post('/send', ensureAuthenticated, async (req, res) => {
  try {
    const { toUser, content } = req.body;
    const newMessage = new Message({
      fromUser: req.user._id,
      toUser,
      content
    });
    await newMessage.save();
    req.flash('success_msg', 'Mensaje enviado exitosamente');
    res.redirect('/messages/inbox');
  } catch (err) {
    req.flash('error_msg', 'Error al enviar el mensaje');
    res.redirect('/messages/inbox');
  }
});

// Ruta para la bandeja de entrada
router.get('/inbox', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({ toUser: req.user._id }).populate('fromUser');
    res.render('messages/inbox', { messages });
  } catch (err) {
    req.flash('error_msg', 'Error al cargar los mensajes');
    res.redirect('/');
  }
});

// Ruta para ver los mensajes enviados
router.get('/sent', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({ fromUser: req.user._id }).populate('toUser');
    res.render('messages/sent', { messages });
  } catch (err) {
    req.flash('error_msg', 'Error al cargar los mensajes enviados');
    res.redirect('/');
  }
});

module.exports = router;
