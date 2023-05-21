const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const Product = require('../Model/Product');
const bcrypt = require('bcrypt');
const { generateToken } = require('../Config/generateToken');
const { protect } = require('../Middleware/Auth');

router.post('/register', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const country = req.body.country;
    const homeAddress = req.body.homeAddress;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const swaphaManager = false;

    User.findOne({ username: username })
        .then(user => {
            if (user) {
                return res.json({
                    status: false, msg: "This username is already exists, please use another username."
                });
            } else {
                User.findOne({ email: email })
                    .then(user => {
                        if (user) {
                            return res.json({
                                status: false, msg: "This email is already exists, please use another email."
                            });
                        } else {
                            return bcrypt.hash(password, 12)
                                .then(hashedPassword => {
                                    const newUser = new User({
                                        name: name,
                                        username: username,
                                        email: email,
                                        phoneNumber: phoneNumber,
                                        country: country,
                                        homeAddress: homeAddress,
                                        swaphaManager: swaphaManager,
                                        password: hashedPassword
                                    });
                                    newUser.save()
                                        .then(user => {
                                            console.log("saved successfully");
                                            req.user = user;
                                            return res.json({
                                                status: true,
                                                msg: "Thanks for registration with Swapha.",
                                                user: user,
                                                sessionId: req.session.id
                                            });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
        });
});

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.json({ status: false, msg: "Sorry, This email doesn't exist." });
            } else {
                bcrypt.compare(password, user.password)
                    .then(isSame => {
                        if (isSame) {
                            req.user = user;
                            console.log({
                                status: true,
                                msg: "Login Successfully.",
                                sessionId: req.session.id,
                                currentUser: req.user,
                                Token: generateToken(req.user._id)
                            });
                            return res.json(
                                {
                                    status: true,
                                    currentUser: req.user,
                                    Token: generateToken(req.user._id)
                                });
                        } else {
                            return res.json({ status: false, msg: "Wrong password, please enter the right password." })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
        });

});

router.post('/editUser/:id', protect, (req, res, next) => {
    const id = req.params.id;
    const name = req.body.name;
    const username = req.body.username;
    const country = req.body.country;
    const homeAddress = req.body.homeAddress;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    User.findOne({ _id: id })
        .then(user => {
            user.name = name;
            user.username = username;
            user.country = country;
            user.homeAddress = homeAddress;
            user.email = email;
            user.phoneNumber = phoneNumber;
            user.save();
            return res.json({ status: true, msg: 'Updated Successfully', currentUser: user });
        })
        .catch(err => { console.log(err); });
});

router.get('/deleteUser/:id', protect, (req, res, next) => {
    const id = req.params.id;
    Product.deleteMany({ userId: id })
        .then(products => {
            User.findById(id)
                .then(user => {
                    user.clearHave()
                        .then(() => {
                            User.findByIdAndDelete(id)
                                .then(user => {
                                    return res.json({ status: true, msg: 'This Account was Deleted' });
                                })
                                .catch(err => { console.log(err); });
                        })
                        .catch(err => { console.log(err); });
                })
                .catch(err => { console.log(err); });
        })
        .catch(err => { console.log(err); });
});

router.get('/getUser', (req, res, next) => {
    if (req.user != null) {
        return res.json({
            user: req.user,
            status: true
        })
    } else {
        return res.json({
            user: null,
            status: false
        });
    }
})

router.get('/swapList/:id', protect, (req, res, next) => {
    const id = req.params.id;
    User.findById(id)
        .then(user => {
            user.populate('have.items.productId')
                .then(userHaves => {
                    return res.json({ status: true, products: userHaves.have.items });
                })
                .catch(err => { console.log(err); });
        })
        .catch(err => { console.log(err); });
});

router.get('/wishlist/:id', protect, (req, res, next) => {
    const id = req.params.id;
    User.findById(id)
        .then(user => {
            user.populate('need.items.productId')
                .then(userHaves => {
                    return res.json({ status: true, products: userHaves.need.items });
                })
                .catch(err => { console.log(err); });
        })
        .catch(err => { console.log(err); });
});

router.get('/delete/swapList/:id', protect, (req, res, next) => {
    const id = req.params.id;
    Product
        .findById(id)
        .then(product => {
            User
                .findById(product.userId.valueOf())
                .then(user => {
                    user
                        .deleteFromHaveList(id)
                        .then(currentUser => {
                            Product
                                .findByIdAndDelete(id)
                                .then(() => {
                                    return res.json({ status: true, currentUser: currentUser });
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        })
                        .catch(err => { console.log(err); });
                })
                .catch(err => {
                    console.log(err);
                });
        }).catch(err => {
            console.log(err);
        });

});

router.get('/delete/wishlist/:id', protect, (req, res, next) => {
    const id = req.params.id;
    Product
        .findById(id)
        .then(product => {
            User
                .findById(product.userId.valueOf())
                .then(user => {
                    user
                        .deleteFromNeedList(id)
                        .then(currentUser => {
                            Product
                                .findByIdAndDelete(id)
                                .then(() => {
                                    return res.json({ status: true, currentUser: currentUser });
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        })
                        .catch(err => { console.log(err); });
                })
                .catch(err => {
                    console.log(err);
                });
        }).catch(err => {
            console.log(err);
        });

});

router.post('/addToHaveList', protect, (req, res, next) => {
    const name = req.body.name;
    const slug = (req.body.name).replace(' ', '-');
    const category = req.body.category;
    const price = req.body.price;
    const desc = req.body.desc;
    const imageUrl = req.body.imageUrl;
    const owner = req.body.owner;
    const swap = true ? req.body.swap === "Yes" : false;
    const buy = true ? req.body.buy === "Yes" : false;
    const userId = req.body.user;

    const newProduct = new Product({
        name: name,
        slug: slug,
        category: category,
        price: price,
        desc: desc,
        imageUrl: imageUrl,
        owner: owner,
        swap: swap,
        buy: buy,
        userId: userId
    });

    newProduct
        .save()
        .then(product => {
            User.findById(userId._id)
                .then(user => {
                    user.addToHaveList(product);
                    console.log(user);
                    return res.json({ status: true, currentUser: user });
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        })
        .catch(err => { console.log(err); });

});

router.post('/addToNeedList', protect, (req, res, next) => {
    const name = req.body.name;
    const slug = (req.body.name).replace(' ', '-');
    const category = req.body.category;
    const price = req.body.price;
    const desc = req.body.desc;
    const imageUrl = req.body.imageUrl;
    const owner = req.body.owner;
    const swap = true ? req.body.swap === "Yes" : false;
    const buy = true ? req.body.buy === "Yes" : false;
    const userId = req.body.user;

    const newProduct = new Product({
        name: name,
        slug: slug,
        category: category,
        price: price,
        desc: desc,
        imageUrl: imageUrl,
        owner: owner,
        swap: swap,
        buy: buy,
        userId: userId
    });

    newProduct
        .save()
        .then(product => {
            User.findById(userId._id)
                .then(user => {
                    user.addToNeedList(product);
                    console.log(user);
                    return res.json({ status: true, currentUser: user });
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        })
        .catch(err => { console.log(err); });

});

router.post('/editProduct/:_id', protect, (req, res, next) => {
    const _id = req.params._id;
    const name = req.body.name;
    const slug = req.body.slug;
    const category = req.body.category;
    const price = req.body.price;
    const desc = req.body.desc;
    const swap = req.body.swap;
    const buy = req.body.buy;
    const imageUrl = req.body.imageUrl;

    Product.findOne({ _id: _id })
        .then(product => {
            product.name = name;
            product.slug = slug;
            product.category = category;
            product.price = price;
            product.desc = desc;
            product.swap = swap;
            product.buy = buy;
            product.imageUrl = imageUrl;
            product.save();
            return res.json({ status: true, msg: 'Updated Successfully' });
        })
        .catch(err => {
            console.log(err);
        });

});

router.get('/getPublicProfile/:_id', (req, res, next) => {
    const id = req.params._id;
    User
        .findById(id)
        .populate('have.items.productId')
        .populate('need.items.productId')
        .then(user => {
            if (!user) {
                return res.json({ status: false });
            } else {
                return res.json({ status: true, user: user });
            }
        })
        .catch(err => { console.log(err); });
});

module.exports = router;