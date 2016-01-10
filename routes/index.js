var utils    = require( '../utils' );
var mongoose = require( 'mongoose' );
var Lister   = mongoose.model( 'Lister' );
var Stores   = mongoose.model( 'Stores' );
var Dept   = mongoose.model( 'Dept' );
var util = require('util');
var async = require('async');


exports.index = function ( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find().exec(cb);},
      lister: function (cb){ Lister.find().populate('dept store').exec(cb);},
      dept: function (cb){ Dept.find().populate({path: 'store'}).exec(cb);}
  }, function(err, result){

  var storetemp = result.stores[0].id;
  var session = req.session;
  if (session.store) {
    //console.log("Store: "+session.store);
    storetemp = session.store;
  };

  var depttemp = result.dept[0].id;
  if (session.dept) {
    depttemp = session.dept;
  };
    var deptlist  = [];
    var lister    = result.lister;
    var dept      = result.dept;
    var stores    = result.stores;

    for (var i = 0; i < dept.length; i++) {
      if(dept[i].store.length > 0){
          for (var s = 0; s < dept[i].store.length; s++) {
            if(dept[i].store[s].id.indexOf(storetemp) > -1){
              deptlist.push(dept[i]);
            }
          };
      }
    };
      res.render( 'index', {
        title         : 'Trish\'s Shopping List',
        stores        : result.stores,
        list          : result.lister,
        dept          : result.dept,
        deptmenu      : deptlist,
        selecteddept  : depttemp,
        selectedstore : storetemp
      });
  }); 
};

exports.changestore = function ( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find().exec(cb);},
      dept: function (cb){ Dept.find().populate({path: 'store'}).exec(cb);}
  }, function(err, result){

    var session       = req.session;
    var storetemp     = req.params.store;
    session.store     = req.params.store;
    session.dept      = req.params.dept;
    console.log("Stored: "+req.params.dept);
    var deptlist      = [];
    var lister        = result.lister;
    var dept          = result.dept;
    var stores        = result.stores;

    console.log("Change Store Returned: "+req.params.store);

    var deptlist = [];
    //var storetemp = req.params.store;
    for (var i = 0; i < dept.length; i++) {
      if(dept[i].store.length > 0){
          for (var s = 0; s < dept[i].store.length; s++) {
            if(dept[i].store[s].id.indexOf(storetemp) > -1){
              deptlist.push(dept[i]);
            }
          };
      }
    };

      res.json(deptlist);
  }); 
};

exports.create = function ( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find({_id: req.body.store}).exec(cb);},
      lister: function (cb){ Lister.find().exec(cb);},
      dept: function (cb){ Dept.find({_id: req.body.dept}).exec(cb);}
  }, function(err, result){

    // console.log("ID: " + req.body.dept);
    // console.log(result.dept.length);

  var session = req.session;
  session.dept = req.body.dept;
  new Lister({
      quantity   : req.body.quantity,
      productName: req.body.productName,
      dept       : result.dept,
      store      : result.stores
  }).save( function ( err, todo, count ){
    if( err ) return next( err );

    res.redirect( '/' );
  });
  }); 

};

exports.destroy = function ( req, res, next ){
  Lister.findById( req.params.id, function ( err, lister ){
    lister.remove( function ( err, lister ) {
      if( err ) return next( err );
      res.redirect( '/' );
    });
  });
};

exports.edit = function( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find().exec(cb);},
      lister: function (cb){ Lister.find().populate('dept store').exec(cb);},
      dept: function (cb){ Dept.find().populate({path: 'store'}).exec(cb);}
  }, function(err, result){



    var storetemp = result.stores[0].id;
    var deptlist  = [];
    var lister    = result.lister;
    var dept      = result.dept;
    var stores    = result.stores;

    for (var i = 0; i < dept.length; i++) {
      if(dept[i].store.length > 0){
          for (var s = 0; s < dept[i].store.length; s++) {
            if(dept[i].store[s].id.indexOf(storetemp) > -1){
              deptlist.push(dept[i]);
            }
          };
      }
    };
      res.render( 'edit', {
        title : 'Edit Item',
        stores : result.stores,
        list : result.lister,
        dept: result.dept,
        deptmenu: deptlist,
        current: req.params.id
      });
  }); 
};

exports.update = function( req, res, next ){
  Lister.findById( req.params.id, function ( err, lister ){

    lister.updated_at   = Date.now();
    lister.quantity     = req.body.quantity,
    lister.productName  = req.body.productName,
    lister.dept         = req.body.dept,
    lister.store        = req.body.store,
    lister.save( function ( err, lister, count ){
      if( err ) return next( err );
      res.redirect( '/' );
    });
  });
};

exports.stores = function( req, res){
  
  async.parallel({
      modelAFind: function (cb){ Stores.find().exec(cb);},
      modelBFind: function (cb){ Lister.find().exec(cb);}
  }, function(err, result){
      res.render( 'stores', {
        title : 'Trish\'s Shopping List',
        stores : result.modelAFind,
        lister : result.modelBFind
      });

  }); 

};

exports.createstore = function ( req, res, next ){
  new Stores({
      storeName   : req.body.storeName,
      address     : req.body.address
      
  }).save( function ( err, stores, count ){
    if( err ) return next( err );

    res.redirect( '/stores' );
  });
};

exports.editstore = function( req, res, next ){

  Stores.
    find().
    exec( function ( err, stores ){
      if( err ) return next( err );

      res.render( 'editstore', {
        title   : 'Trish\'s Shopping List',
        stores   : stores,
        current : req.params.id
      });
    });
};

exports.updatestore = function( req, res, next ){
  Stores.findById( req.params.id, function ( err, stores ){

    stores.storeName = req.body.storeName,
    stores.address   = req.body.address,
    stores.save( function ( err, stores, count ){
      if( err ) return next( err );
      res.redirect( '/stores' );
    });
  });
};

exports.destroystore = function ( req, res, next ){
  Stores.findById( req.params.id, function ( err, stores ){
    stores.remove( function ( err, stores ){
      if( err ) return next( err );
      res.redirect( '/stores' );
    });
  });
};





exports.dept = function( req, res){
async.parallel({
    Dept: function(cb){Dept.find().exec(cb);},
    Stores: function (cb){ Stores.find().exec(cb);}
  },
  function(err, result){
    res.render( 'dept', {
        title   : 'Trish\'s Shopping List',
        dept: result.Dept,
        stores: result.Stores
      });

  });

};

exports.createdept = function ( req, res, next ){
    //create the object from the list of stores
        console.log("Stores: " + req.body.storesel);
    var fetchstring = [];
    for (var i = 0; i < req.body.storesel.length; i++) {
      fetchstring.push(req.body.storesel[i]);
    };

  async.parallel({
    Stores: function (cb){ Stores.find({ '_id':{ $in: fetchstring }}).exec(cb);}
  },
  function(err, result){

    new Dept({
        deptName   : req.body.deptName,
        store      : result.Stores
    }).save( function ( err, dept, count ){
      if( err ) return next( err );
      res.redirect( '/dept' );
    });
  });
};


exports.editdept = function( req, res, next ){
  async.parallel({
      Stores: function (cb){ Stores.find().exec(cb);},
      Dept: function (cb){ Dept.find().exec(cb);}
  }, function(err, result){

      res.render( 'editdept', {
        title : 'Trish\'s Shopping List',
        stores : result.Stores,
        dept : result.Dept,
        current : req.params.id
      });

  }); 
};

exports.updatedept = function( req, res, next ){
    //create the object from the list of stores
    var fetchstring = [];
    for (var i = 0; i < req.body.storesel.length; i++) {
      fetchstring.push(req.body.storesel[i]);
    };

  async.parallel({
    Dept: function(cb){Dept.findById(req.params.id).exec(cb);},
    Stores: function (cb){ Stores.find({ '_id':{ $in: fetchstring }}).exec(cb);}
  },
  function(err, result){
    
    var dept = result.Dept;
    dept.store = [];
    dept.deptName = req.body.deptName;

    //check that the store is not already in the list
    for (var i = 0; i < result.Stores.length; i++) {
      if(dept.store.indexOf(result.Stores[i].id) == -1){
        dept.store.push(result.Stores[i].id);
      }
    };

    dept.save( function ( err, dept, count ){
      if( err ) return next( err );
      res.redirect( '/dept' );
    });
  });

};







exports.destroydept = function ( req, res, next ){
  Dept.findById( req.params.id, function ( err, dept ){
    dept.remove( function ( err, dept ){
      if( err ) return next( err );
      res.redirect( '/dept' );
    });
  });
};




// ** express turns the cookie key to lowercase **
exports.current_user = function ( req, res, next ){
  var user_id = req.cookies ?
      req.cookies.user_id : undefined;

  if( !user_id ){
    res.cookie( 'user_id', utils.uid( 32 ));
  }

  next();
};
