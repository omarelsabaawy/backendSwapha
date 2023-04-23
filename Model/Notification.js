const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new mongoose.Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    body: {
        type: String,
        required: true
    },
    swap: {
        type: Boolean,
        required: true
    },
    buy: {
        type: Boolean,
        required: true
    },
    accepted: {
        type: Boolean,
        required: true
    },
    declined: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);