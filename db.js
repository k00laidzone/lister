var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var bcrypt   = require( 'bcrypt-nodejs' );

var Lister = new Schema({
    quantity   : Number,
    productName: String,
    dept       : [{ type: Schema.Types.ObjectId, ref: 'Dept' }],
    store      : [{ type: Schema.Types.ObjectId, ref: 'Stores' }],
    updated_at : Date,
    created_by : String
});

var Stores = new Schema({
    storeName  : String,
    address    : String,
    created_by : String
});

var Dept = new Schema({
    deptName  : String,
    store: [{ type: Schema.Types.ObjectId, ref: 'Stores' }],
    created_by : String

});

var userSchema = new Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

mongoose.model( 'Lister', Lister );
mongoose.model( 'User', userSchema);
mongoose.model( 'Stores', Stores );
mongoose.model( 'Dept', Dept );

mongoose.connect( 'mongodb://testuser:testuser@ds039135.mongolab.com:39135/abc123' );
