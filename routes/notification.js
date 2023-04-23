const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const Notification = require('../Model/Notification');
const Product = require('../Model/Product');

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
                                            declined: false
                                        });

                                        newSwapRequest
                                            .save()
                                            .then(swapRequest => {
                                                console.log("swap request from " + userFrom.username + " to " + userTo.username + " on a " + product.name);
                                                return res.json({
                                                    status: true,
                                                    msg: "Your Swap request was sent to " + userTo.username + " wait for his response.",
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

router.get('/:userId', async (req, res, next) => {
    const { userId } = req.params;
    Notification.find({ to: userId }).then(nots => { res.send(nots); }).catch(err => { console.log(err); })
});

module.exports = router;