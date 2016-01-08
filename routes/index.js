var utils    = require( '../utils' );
var mongoose = require( 'mongoose' );
var Lister   = mongoose.model( 'Lister' );
var Stores   = mongoose.model( 'Stores' );
var Dept   = mongoose.model( 'Dept' );
var util = require('util');
var async = require('async');

exports.index = function ( req, res, next ){
  async.parallel({
      modelAFind: function (cb){ Stores.find().exec(cb);},
      modelBFind: function (cb){ Lister.find().exec(cb);},
      modelCFind: function (cb){ Dept.find().exec(cb);}
  }, function(err, result){
      res.render( 'index', {
        title : 'Trish\'s Shopping List',
        stores : result.modelAFind,
        list : result.modelBFind,
        dept: result.modelCFind
      });

  }); 
};

exports.create = function ( req, res, next ){
  new Lister({
      quantity   : req.body.quantity,
      productName: req.body.productName,
      dept       : req.body.dept,
      store      : req.body.store,
      updated_at : Date.now()
  }).save( function ( err, todo, count ){
    if( err ) return next( err );

    res.redirect( '/' );
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
      modelAFind: function (cb){ Stores.find().exec(cb);},
      modelBFind: function (cb){ Lister.find().exec(cb);},
      modelCFind: function (cb){ Dept.find().exec(cb);}
  }, function(err, result){
      res.render( 'edit', {
        title : 'Trish\'s Shopping List',
        stores : result.modelAFind,
        list : result.modelBFind,
        dept : result.modelCFind,
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
  
  Dept.find().exec(function ( err, dept ){
    res.render( 'dept', {
        title   : 'Trish\'s Shopping List',
        dept: dept
      });
  })

};

exports.createdept = function ( req, res, next ){
  new Dept({
      deptName   : req.body.deptName      
  }).save( function ( err, dept, count ){
    if( err ) return next( err );
    res.redirect( '/dept' );
  });
};


exports.editdept = function( req, res, next ){

  Dept.
    find().
    exec( function ( err, dept ){
      if( err ) return next( err );

      res.render( 'editdept', {
        title   : 'Trish\'s Shopping List',
        dept    : dept,
        current : req.params.id
      });
    });
};

exports.updatedept = function( req, res, next ){
  Dept.findById( req.params.id, function ( err, dept ){
    dept.deptName = req.body.deptName,

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
