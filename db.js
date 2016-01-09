var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Lister = new Schema({
    quantity   : Number,
    productName: String,
    dept       : [{ type: Schema.Types.ObjectId, ref: 'Dept' }],
    store      : [{ type: Schema.Types.ObjectId, ref: 'Stores' }],
    updated_at : Date
});

var Stores = new Schema({
    storeName  : String,
    address    : String
});

var Dept = new Schema({
    deptName  : String,
    store: [{ type: Schema.Types.ObjectId, ref: 'Stores' }]

});

mongoose.model( 'Lister', Lister );
var Stores = mongoose.model( 'Stores', Stores );
mongoose.model( 'Dept', Dept );

mongoose.connect( 'mongodb://testuser:testuser@ds039135.mongolab.com:39135/abc123' );
