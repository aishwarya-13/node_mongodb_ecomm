const mongodb = require('mongodb');
const getDB = require('../util/database.js').getDB;

module.exports = class Users{
    constructor(email, password,cart, id , resetToken, resetExpiration){
        //this.name = name;
        this.email = email;
        this.cart = cart;// {items:[]}
        this._id = id;
        this.password = password;
        this.resetToken = resetToken;
        this.resetTokenExpiration = resetExpiration;
    }

    save(){
        return getDB().collection('users').insertOne(this).then(()=>{

        }).catch((error)=>{
            console.log('save error', error);
        })
    };

    update(){
        return getDB().collection('users').updateOne(
            {_id: new mongodb.ObjectId(this._id)},
            {$set:
                {password: this.password, resetToken: this.resetToken, resetTokenExpiration: this.resetTokenExpiration}
            }
        )
    };

    static getUserById(userId){
        return getDB().collection('users').findOne({_id: new mongodb.ObjectId(userId)})//.next()
        .then((userInfo)=>{
            //console.log('userInfo', userInfo);
            return userInfo;
        }).catch((error)=>{
            console.log('getUserById error', error);
        })
    };

    static getUserByEmail(email){
        return getDB().collection('users').findOne({email: email}).then((userInfo)=>{
            return userInfo;
        }).catch((error)=>{
            console.log('getUserById error', error);
        });
    };

    static getUserByToken(token){
        return getDB().collection('users').findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}}).then((user)=>{
            return user;
        }).catch((error)=>{
            console.log('getUserById error', error);
        });
    };


    addToCart(product){
        let newQuantity = 1;
        let {cart} = this;
        const updatedCartItems = [...this.cart.items];

        const cartProductIndex = cart.items.findIndex((cp)=>{
            return cp.productId.toString() == product._id.toString();
        });
        if(cartProductIndex !== -1){//Existing product
            newQuantity = cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }else{
            updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity});
        }
        
        const updatedcart = { items: updatedCartItems};
        return getDB().collection('users').updateOne(
            {_id: new mongodb.ObjectId(this._id)},
            {$set:{cart: updatedcart}}
        ).then((result)=>{
        }).catch((error)=>{
            console.log('addToCart error', error);
        })
    };

    getCart = ()=>{
       const db = getDB(); let upCartItems = []; let prods = []; let productsInDB = []; let tCartItems = [...this.cart.items]
       const productIds = tCartItems.map(item => item.productId);
       return db.collection('products').find({_id: {$in: productIds}}).toArray().then((products)=>{
           if(products.length){
                prods = products.map(p => {
                    productsInDB.push(p._id.toString());
                    return{
                        ...p,
                        quantity: tCartItems.find(item => item.productId.toString() === p._id.toString()).quantity
                    }
                });
               if(productsInDB.length !== tCartItems.length){//Remove deleted products from cart
                upCartItems = tCartItems.filter(pro => productsInDB.includes(pro.productId.toString()))
                db.collection('users').updateOne(
                    {_id: new mongodb.ObjectId(this._id)},
                    {$set:{cart:{items: upCartItems}}}
                )
               }
               return prods;
           }else{//If products collection is empty then empty the user cart
            this.cart = {items: []}; 
            db.collection('users').updateOne(
                {_id: new mongodb.ObjectId(this._id)},
                {$set:{cart: {items: []}}}
            );
            return this.cart
           }; 
       }).catch((err)=>{
           console.log('getCart error', err);
       });
    };

    deleteCartItem = (productId)=>{
        const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
        const updatedcart = { items: updatedCartItems};
        console.log('updatedcart', updatedcart)
        return getDB().collection('users').updateOne(
            {_id: new mongodb.ObjectId(this._id)},
            {$set:{cart: updatedcart }}
        )
    };

    addOrder = ()=>{
        let db = getDB();

        return this.getCart().then((products)=>{
            const order = {
                items: products,
                user: {
                    _id: new mongodb.ObjectId(this._id),
                    name: this.name
                }
            };
            return db.collection('orders').insertOne(order).then((result)=>{
                if(result){
                    let updatedCart = this.cart = {items: []}; 
                    db.collection('users').updateOne(
                        {_id: new mongodb.ObjectId(this._id)},
                        {$set: {cart: updatedCart}}
                    )
                }
            })
        }).catch((err)=>{
            console.log('err', err);
        });
    };

    getOrders = ()=>{
        return getDB().collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray().then((orders)=>{
            return orders;
        }).catch((err)=>{
            console.log('err', err);
        });
    };
};