const { request } = require('express');
const Product = require('../model/products.js');
const Users = require('../model/users.js');

getIndex = (request, response, next)=>{
    response.render('shop/index',{
        pageTitle: `Aishwarya's`, 
        //isAuthenticated: request.session.isAuthenticated
    })
};

getProducts = (request, response, next)=>{
    Product.getAllProducts().then((products)=>{
        response.render('shop/products',{
            pageTitle: `Products`,
            products: products, 
            //isAuthenticated: request.session.isAuthenticated
        })
    }).catch((error)=>{
        console.log('error', error);
    })
};

getById = (request, response, next)=>{
    Product.getById(request.params.productId).then((productInfo)=>{
        response.render('shop/productDetail',{
            pageTitle: 'Product Detail',
            productInfo: productInfo, 
            //isAuthenticated: request.session.isAuthenticated
        })
    }).catch((error)=>{
        console.log('getById error', error)
    });
};

/**
 * Add to cart
 */
addToCart = (request, response, next)=>{
    Product.getById(request.params.productId).then((productInfo)=>{
        console.log('user', request.user)
        request.user.addToCart(productInfo).then(()=>{
            response.redirect('/cart',{
                //isAuthenticated: request.session.isAuthenticated
            });
        })
    })
};

getCart = (request, res, next)=>{
    request.user.getCart().then((cart)=>{
        res.render('shop/cart',{
            pageTitle:'Cart',
            cart: cart, 
            //isAuthenticated: request.session.isAuthenticated
        });
    }).catch(err =>{
        console.log('getCart shop error', err);
    });
};

deleteCartItem = (req, res, next)=>{
    let productId = req.params.productId;
    req.user.deleteCartItem(productId).then(()=>{
        res.redirect('/cart',{
            //isAuthenticated: req.session.isAuthenticated
        });
    }).catch(err =>{
        console.log('getCart shop error', err);
    });
};

placeOrder = (req, res, next)=>{
    req.user.addOrder().then(()=>{
        res.redirect('/orders',{
            //isAuthenticated: req.session.isAuthenticated
        });
    }).catch(err =>{
        console.log('placeOrder shop error', err);
    });
};

getOrders = (req, res, next)=>{
    req.user.getOrders().then((orders)=>{
        res.render('shop/orders',{
            pageTitle:'Orders',
            orders: orders, 
            //isAuthenticated: req.session.isAuthenticated
        })
    }).catch(err =>{
        console.log('orders shop error', err);
    });
};

module.exports = {
    getIndex: getIndex,
    getProducts: getProducts,
    getById: getById,
    addToCart: addToCart,
    getCart: getCart,
    deleteCartItem: deleteCartItem,
    placeOrder: placeOrder,
    getOrders: getOrders
};