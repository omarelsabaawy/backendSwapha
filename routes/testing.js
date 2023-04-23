var express = require('express');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const User = require('../Model/User');
const Product = require('../Model/Product');
var router = express.Router();

async function generateImageUrl(category) {
    const hash = crypto.createHash('sha256');
    const email = faker.internet.email();
    const randomString = faker.random.numeric(2);

    // Generate a random image from PlaceIMG with the given category
    const width = 668;
    const height = 668;
    const imageUrl = `https://source.unsplash.com/collection/1163637/${width}x${height}/?sig=${randomString}`;

    hash.update(email + randomString);
    const digest = hash.digest('hex');

    return `${imageUrl}?sig=${digest}`;
}

router.get('/testing/products', (req, res, next) => {
    generateImageUrl("any").then(imageUrl => {
        for (let i = 0; i < 10000; i++) {
            console.log(`${i} has been added`);
            const newUser = new User({
                name: faker.name.fullName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                phoneNumber: faker.phone.number(),
                country: faker.address.country(),
                homeAddress: faker.address.streetAddress(),
                swaphaManager: false,
                password: faker.internet.password()
            });
            newUser.save().then(user => {
                const newProduct = new Product({
                    name: faker.commerce.productName(),
                    slug: (faker.commerce.productName()).replace(' ', '-'),
                    category: faker.commerce.department(),
                    price: faker.commerce.price(),
                    desc: faker.commerce.productDescription(),
                    imageUrl: imageUrl,
                    owner: user.name,
                    swap: true ? i % 2 == 0 : false,
                    buy: true,
                    userId: user,
                });
                newProduct.save().then(product => {
                    newUser.addToHaveList(product);
                    console.log("done");
                }).catch(err => { console.log(err); });
            }).catch(err => {
                console.log(err);
            });
        }
    }).catch(err => { console.log(err); })
    return res.send("done");
})


module.exports = router;