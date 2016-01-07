var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Lister = new Schema({
    quantity   : Number,
    productName: String,
    dept       : String,
    store      : String,
    updated_at : Date
});

var Stores = new Schema({
    storeName  : String,
    address    : String
});

var Dept = new Schema({
    deptName  : String
});

mongoose.model( 'Lister', Lister );
mongoose.model( 'Stores', Stores );
mongoose.model( 'Dept', Dept );

mongoose.connect( 'mongodb://testuser:testuser@ds039135.mongolab.com:39135/abc123' );
