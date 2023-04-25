const mongodb = require('mongodb');
const getDB = require('../util/database.js').getDB;

class Product{
    constructor(title, price, description, imageUrl, id, userId){
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
    }

    save(){
        let {_id} = this, dbOp;
        const db = getDB();
        if(_id){
            dbOp = db.collection('products').updateOne({_id: _id}, {$set: this})
        }else{
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp.then((result)=>{
        }).catch((error)=>{
            console.log('save product model error',error);
        })
    }

    static getAllProducts(userId){
        const db = getDB();
        return db.collection('products').find({userId: new mongodb.ObjectId(userId)}).toArray().then((products)=>{
            return products;
        }).catch((error)=>{
            console.log('getAllProducts error', error);
        })
    };


    static getById(productId){
        const db = getDB();
        return db.collection('products').find({_id: new mongodb.ObjectId(productId)}).next().then((productInfo)=>{
            return productInfo;
        }).catch((error)=>{
            console.log('getById error', error);
        })
    };

    static deleteById(productId){
        return getDB().collection('products').deleteOne({_id: new mongodb.ObjectId(productId)})
    };
}

module.exports = Product;