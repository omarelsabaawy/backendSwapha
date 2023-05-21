const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const Notification = require('../Model/Notification');
const Product = require('../Model/Product');
const { protect } = require('../Middleware/Auth');

router.post('/sendSwapRequest', (req, res, next) => {
    const from = req.body.from;
    const to = req.body.to;
    const productId = req.body.productId;

    Notification
        .find({ from: from, to: to, productId: productId, swap: true })
        .then(request => {
            if (request.length === 0) {
                User.findById(from)
                    .then(userFrom => {
                        User.findById(to)
                            .then(userTo => {
                                Product.findById(productId)
                                    .then(product => {
                                        const message = userFrom.username + " wants to swap " + product.name + " with you";

                                        const newSwapRequest = new Notification({
                                            from: from,
                                            to: to,
                                            productId: productId,
                                            body: message,
                                            swap: true,
                                            buy: false,
                                            accepted: false,
                                            declined: false,
                                            response: ""
                                        });

                                        const SwapRequest = new Notification({
                                            from: to,
                                            to: from,
                                            productId: productId,
                                            body: "you send a swap request to " + userTo.username + " to swap product " + product.name,
                                            swap: true,
                                            buy: true,
                                            accepted: true,
                                            declined: true,
                                            response: "Wait for " + userTo.username + " to reply."
                                        });

                                        SwapRequest.save();

                                        newSwapRequest
                                            .save()
                                            .then(swapRequest => {
                                                console.log("swap request from " + userFrom.username + " to " + userTo.username + " on a " + product.name);
                                                return res.json({
                                                    status: true,
                                                    msg: "Your Swap request was sent to " + userTo.username + " wait for his response.",
                                                    notification: newSwapRequest
                                                })
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                return res.json({
                                                    status: false,
                                                    msg: "An Error occurred please try again in a while. ",
                                                })
                                            });

                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return res.json({
                                            status: false,
                                            msg: "Product is no longer Exists.",
                                        })
                                    });
                            }).catch(err => {
                                console.log(err);
                                return res.json({
                                    status: false,
                                    msg: "This product owner is no longer exists.",
                                })
                            });
                    }).catch(err => {
                        console.log(err);
                        return res.json({
                            status: false,
                            msg: "Please Login first to send a Swap Request.",
                        })
                    });

            } else {
                return res.json({ status: false, msg: "A Swap Request was sent before." })
            }
        })
        .catch(err => {
            console.log(err);
        });

});

router.post('/sendBuyRequest', (req, res, next) => {
    const from = req.body.from;
    const to = req.body.to;
    const productId = req.body.productId;

    Notification
        .find({ from: from, to: to, productId: productId, buy: true })
        .then(request => {
            if (request.length === 0) {
                User.findById(from)
                    .then(userFrom => {
                        User.findById(to)
                            .then(userTo => {
                                Product.findById(productId)
                                    .then(product => {
                                        const message = userFrom.username + " wants to Buy " + product.name + " from you.";

                                        const newBuyRequest = new Notification({
                                            from: from,
                                            to: to,
                                            productId: productId,
                                            body: message,
                                            swap: false,
                                            buy: true,
                                            accepted: false,
                                            declined: false,
                                            response: ""
                                        });

                                        const BuyRequest = new Notification({
                                            from: to,
                                            to: from,
                                            productId: productId,
                                            body: "you send a buy request to " + userTo.username + " to buy product " + product.name,
                                            swap: true,
                                            buy: true,
                                            accepted: true,
                                            declined: true,
                                            response: "Wait for " + userTo.username + " to reply."
                                        });

                                        BuyRequest.save();

                                        newBuyRequest
                                            .save()
                                            .then(swapRequest => {
                                                console.log("Buy request from " + userFrom.username + " to " + userTo.username + " to buy " + product.name);
                                                return res.json({
                                                    status: true,
                                                    msg: "Your Buy request was sent to " + userTo.username + " wait for his response.",
                                                    notification: newBuyRequest
                                                })
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                return res.json({
                                                    status: false,
                                                    msg: "An Error occurred please try again in a while. ",
                                                })
                                            });

                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return res.json({
                                            status: false,
                                            msg: "Product is no longer Exists.",
                                        })
                                    });
                            }).catch(err => {
                                console.log(err);
                                return res.json({
                                    status: false,
                                    msg: "This product owner is no longer exists.",
                                })
                            });
                    }).catch(err => {
                        console.log(err);
                        return res.json({
                            status: false,
                            msg: "Please Login first to send a Buy Request.",
                        })
                    });

            } else {
                return res.json({ status: false, msg: "A Buy Request was sent before." })
            }
        })
        .catch(err => {
            console.log(err);
        });

});

router.post('/AcceptRequest', (req, res, next) => {
    const messageId = req.body.messageId;
    Notification
        .findById(messageId)
        .populate('from')
        .populate('to')
        .then(notification => {
            notification.accepted = true;
            notification.save();
            const newMessage = new Notification({
                from: notification.to._id,
                to: notification.from._id,
                productId: notification.productId,
                body: notification.to.username + " Accepted your Request.",
                swap: false,
                buy: false,
                accepted: true,
                declined: true,
                response: "Congratulations, " + notification.to.username + " Accepted your Request, wait for his message."
            });
            newMessage.save();
            return res.json({ status: true, notification: newMessage });
        })
        .catch(err => {
            console.log(err)
            return res.json({ status: false });
        })
});

router.post('/DeclineRequest', (req, res, next) => {
    const messageId = req.body.messageId;
    Notification
        .findById(messageId)
        .populate('from')
        .populate('to')
        .then(notification => {
            notification.declined = true;
            notification.response = notification.to.username + " declined " + notification.from.username + " Request";
            notification.save();
            const newMessage = new Notification({
                from: notification.to._id,
                to: notification.from._id,
                productId: notification.productId,
                body: notification.to.username + " rejected your Request.",
                swap: false,
                buy: false,
                accepted: false,
                declined: true,
                response: "We are sorry " + notification.to.username + " Declined your Request."
            });
            newMessage.save();
            return res.json({ status: true, notification: newMessage });
        })
        .catch(err => {
            console.log(err)
            return res.json({ status: false });
        })
});

router.post('/sendMessage', (req, res, next) => {
    const messageId = req.body.messageId;
    const msg = req.body.msg;

    Notification
        .findById(messageId)
        .populate('from')
        .populate('to')
        .then(notification => {
            notification.response = msg;
            notification.save();
            const newNotification = new Notification({
                from: notification.to._id,
                to: notification.from._id,
                productId: notification.productId,
                body: msg,
                swap: false,
                buy: false,
                accepted: true,
                declined: false,
                response: ""
            });
            newNotification.save();
            return res.json({ status: true, response: msg, messageReceived: true, notification: newNotification });
        })
        .catch(err => {
            console.log('====================================');
            console.log(err);
            console.log('====================================');
        })

});

router.get('/:userId', (req, res, next) => {
    const { userId } = req.params;
    Notification
        .find({ to: userId })
        .populate('from')
        .sort({ updatedAt: -1 })
        .then(nots => {
            const formattedNotifications = nots.map(n => {
                const timestamp = new Date(n.updatedAt).toLocaleString();
                return { ...n.toObject(), timestamp };
            });
            console.log(formattedNotifications)
            return res.json({ messages: formattedNotifications });
        })
        .catch(err => {
            console.log(err);
        })
});

module.exports = router;