const express = require('express');
const router = express.Router();
const shop = require('../controller/shop.js');
const {isUserLoggedIn} = require('../custom_middleware/auth');

router.get('/', shop.getIndex);

router.get('/products', shop.getProducts);

router.get('/products/:productId', shop.getById);

router.get('/add-to-cart/:productId', isUserLoggedIn ,shop.addToCart);

router.get('/cart', isUserLoggedIn, shop.getCart);

router.get('/delete/cart-item/:productId', isUserLoggedIn ,shop.deleteCartItem);

router.get('/place-order', isUserLoggedIn, shop.placeOrder);

router.get('/orders', isUserLoggedIn, shop.getOrders);

module.exports = router;