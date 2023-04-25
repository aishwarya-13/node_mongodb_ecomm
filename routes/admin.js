const express = require('express');
const router = express.Router();

const admin = require('../controller/admin.js');
const {isUserLoggedIn} = require('../custom_middleware/auth');

//Custome Middleware
//router.use(isUserLoggedIn);

router.get('/add-product', isUserLoggedIn, admin.addProductPage);

router.post('/product', isUserLoggedIn, admin.addProduct);

router.get('/products', isUserLoggedIn, admin.getAllProducts);

router.get('/edit-product/:productId', isUserLoggedIn, admin.editProduct);

router.post('/update-product', isUserLoggedIn, admin.updateProduct);

router.get('/delete-product/:productId', isUserLoggedIn, admin.deleteProduct)

module.exports = router;