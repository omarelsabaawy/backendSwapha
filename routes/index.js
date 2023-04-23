const express = require('express');
const router = express.Router();
const Product = require('../Model/Product');
const User = require('../Model/User');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'My graduation Project API' });
});

router.get('/api/homeProducts', (req, res) => {
  Product
    .find({ swap: true })
    .limit(4)
    .exec()
    .then(products => {
      res.send(products)
    })
    .catch(err => { console.log(err); });
});

router.get('/api/products', (req, res) => {
  Product
    .find()
    .then(proucts => {
      res.send(proucts);
    })
    .catch(err => { console.log(err); });
});

router.get('/api/products/slug/:slug', (req, res) => {
  const slug = req.params.slug;
  console.log(slug);

  Product
    .findById(slug)
    .then(product => {
      res.send(product);
      console.log(product);
    })
    .catch(err => { console.log(err); });

});

router.get('/api/products/swap/numbers/:country', (req, res) => {
  Product.aggregate([
    { $match: { swap: true } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $match: { 'user.country': req.params.country } },
    { $count: 'totalProducts' }
  ]).exec(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      return res.json(result[0]);
    }
  });
})

router.get('/api/products/buy/numbers/:country', (req, res) => {
  Product.aggregate([
    { $match: { buy: true } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $match: { 'user.country': req.params.country } },
    { $count: 'totalProducts' }
  ]).exec(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      return res.json(result[0]);
    }
  });
})
router.get('/api/products/swap/:country', async (req, res) => {
  const { country } = req.params;
  const { page, perPage } = req.query;

  try {
    const [products] = await Promise.all([
      Product.aggregate([
        {
          $match: { swap: true }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: { 'user.country': new RegExp(`^${country}$`, 'i') }
        },
        {
          $skip: (page - 1) * perPage
        },
        {
          $limit: parseInt(perPage)
        },
        {
          $project: {
            _id: 1,
            name: 1,
            desc: 1,
            imageUrl: 1,
            swap: 1,
            buy: 1,
            category: 1,
            userId: 1,
            'user.name': 1,
            'user.country': 1
          }
        }
      ])
    ]);
    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


router.get('/api/products/buy/:country', async (req, res) => {
  const { country } = req.params;
  const { page, perPage } = req.query;

  try {
    const [products] = await Promise.all([
      Product.aggregate([
        {
          $match: { buy: true }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: { 'user.country': new RegExp(`^${country}$`, 'i') }
        },
        {
          $skip: (page - 1) * perPage
        },
        {
          $limit: parseInt(perPage)
        },
        {
          $project: {
            _id: 1,
            name: 1,
            desc: 1,
            imageUrl: 1,
            swap: 1,
            buy: 1,
            category: 1,
            userId: 1,
            'user.name': 1,
            'user.country': 1
          }
        }
      ])
    ]);

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


router.get('/api/products/search/:country', async (req, res, next) => {
  const { country } = req.params;
  const { page, perPage } = req.query;
  const keyword = req.query.query
    ? {
      $or: [
        { name: { $regex: req.query.query, $options: "i" } },
        { desc: { $regex: req.query.query, $options: "i" } },
        { category: { $regex: req.query.query, $options: "i" } }
      ],
    }
    : {};

  try {
    const [products] = await Promise.all([
      Product.aggregate([
        {
          $match: { ...keyword }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: { 'user.country': new RegExp(`^${country}$`, 'i'), $or: [{ swap: true }, { buy: true }] }
        },
        {
          $skip: (page - 1) * perPage
        },
        {
          $limit: parseInt(perPage)
        },
        {
          $project: {
            _id: 1,
            name: 1,
            desc: 1,
            imageUrl: 1,
            swap: 1,
            buy: 1,
            category: 1,
            userId: 1,
            'user.name': 1,
            'user.country': 1
          }
        }
      ])
    ]);

    res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/api/products/search/numbers/:country', (req, res) => {
  const keyword = req.query.query
    ? {
      $or: [
        { name: { $regex: req.query.query, $options: "i" } },
        { desc: { $regex: req.query.query, $options: "i" } },
        { category: { $regex: req.query.query, $options: "i" } }
      ],
    }
    : {};
  Product.aggregate([
    { $match: { ...keyword } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $match: { 'user.country': req.params.country } },
    { $count: 'totalProducts' }
  ]).exec(function (err, result) {
    if (err) {
      console.log(err);
    } else {
      return res.json(result[0]);
    }
  });
})


module.exports = router;