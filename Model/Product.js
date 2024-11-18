const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    subSubCategory: { type: String },
    hashtags: [{ type: String }],
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'], required: true },
    colors: [{ type: String }],
    brand: { type: String },
    imageUrls: [{ type: String, required: true }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, min: 0 },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: { type: [Number], required: false }
    },
    status: { type: String, enum: ['Available', 'Reserved', 'Swapped'], default: 'Available' },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    swapHistory: [{
        swappedWithUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        swappedItemId: { type: Schema.Types.ObjectId, ref: 'Product' },
        swappedAt: { type: Date },
        swapValueDifference: { type: Number }
    }],
    reviews: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    deliveryOptions: {
        isPickupAvailable: { type: Boolean, default: true }, // Indicates if pickup is an option
        isShippingAvailable: { type: Boolean, default: false }, // Indicates if shipping is an option
        shippingCost: { type: Number, default: 0 }, // Cost if the seller offers shipping
        isDeliveryByUser: { type: Boolean, default: false }, // Indicates if the delivery is handled by the user
        deliveryRadius: { type: Number, default: 0 } // Radius (in miles/km) within which the user can deliver
    },
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

// const productSchema = new mongoose.Schema({

//     name: {
//         type: String,
//         required: true
//     },
//     slug: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     price: {
//         type: Number,
//         required: false
//     },
//     desc: {
//         type: String,
//         required: true
//     },
//     imageUrl: {
//         type: String,
//         required: true
//     },
//     owner: {
//         type: String,
//         required: true
//     },
//     swap: {
//         type: Boolean,
//         required: false
//     },
//     buy: {
//         type: Boolean,
//         required: false
//     },
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     }
// });

// module.exports = mongoose.model('Product', productSchema);
