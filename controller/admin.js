const Product = require('../model/products.js');


const addProductPage = (request, response, next)=>{
    response.render('admin/addProduct',{
        pageTitle: 'Add Product',
        isEdit: false, 
        isAuthenticated: request.session.isAuthenticated
    })
};

const addProduct = (request, response, next)=>{
    let {title, price, description, imageUrl} = request.body,
    product = new Product(title, price, description, imageUrl, null, request.session.user._id);
    product.save().then((result)=>{
       //console.log('addProduct result',result);
       response.redirect('/admin/products');
    }).catch((error)=>{
        console.log('addProduct error',error);
    })
    //response.render()
};

const getAllProducts = (request, response, next)=>{
    let userId = request.session.user._id;
    Product.getAllProducts(userId).then((products)=>{
        response.render('admin/products',{
            pageTitle: 'Products',
            products: products, 
            //isAuthenticated: request.session.isAuthenticated
        })
    }).catch((error)=>{
        console.log('getAllProducts error', error);
    });
};

const editProduct = (request, response, next)=>{
    let userId = request.session.user._id.toString();
    Product.getById(request.params.productId).then((productInfo)=>{
        if(productInfo.userId.toString() !== userId){
            return res.render('message', {pageTitle: 'Error', message: 'Not authorized!'});
        }
        response.render('admin/addProduct',{
            pageTitle: 'Edit Product',
            isEdit: true,
            productInfo: productInfo, 
            //isAuthenticated: request.session.isAuthenticated
        })
    }).catch((error)=>{
        console.log('editProduct error', error);
    })
};

const updateProduct = (request, response)=>{
    const {title, price, description, imageUrl, productId} = request.body,
    product = new Product(title, price, description, imageUrl, productId);
    product.save().then(()=>{
        response.redirect('/admin/products');
    }).catch((error)=>{
        console.log('error', error);
    })
};

const deleteProduct = (request, response, next)=>{
    Product.deleteById(request.params.productId).then(()=>{
        response.redirect('/admin/products');
    }).catch((error)=>{
        console.log('error', error)
    })
};

module.exports = {
    addProductPage: addProductPage,
    addProduct: addProduct,
    getAllProducts: getAllProducts,
    editProduct: editProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct
}