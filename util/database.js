const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback)=>{
    //MongoClient.connect('mongodb+srv://aishwaryavhatkar:mongoDB7@cluster0-o06ha.mongodb.net/shop?retryWrites=true&w=majority')
    //MongoClient.connect('mongodb+srv://iaishwaryavhatkar:mongoDB7@cluster0.afuzy.mongodb.net/shop')
    const uri = 'mongodb+srv://iaishwaryavhatkar:mongoDB7@cluster0.afuzy.mongodb.net/shop?retryWrites=true&w=majority&ssl=true';
    MongoClient.connect(uri,{ useUnifiedTopology: true })
    .then((client)=>{
        console.log('Database connected successfully!');
        _db = client.db();//client.db('database name');
        callback(client);
    })
    .catch((error)=>{
        console.log('error',error);
        throw error;
    })
};

const getDB = ()=>{
    if(_db){
        return _db;
    }
    throw 'No database found';
}

module.exports = {
    mongoConnect: mongoConnect,
    getDB: getDB
}