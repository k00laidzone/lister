module.exports = function(db, passport){


var utils    = require( '../utils' );
var mongoose = require( 'mongoose' );
var Lister   = mongoose.model( 'Lister' );
var Stores   = mongoose.model( 'Stores' );
var User     = mongoose.model( 'User' );
var Dept     = mongoose.model( 'Dept' );
var Settings = mongoose.model( 'Settings' );
var util     = require('util');
var async    = require('async');


var functions = {};

functions.index = function ( req, res, next ){
  res.render( 'index', {
    title: 'Welcome'  
  })
}

functions.list = function ( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
      lister: function (cb){ Lister.find({ 'created_by': { $eq: req.user.id } }).populate('dept store').exec(cb);},
      dept: function (cb){ Dept.find({ 'created_by': { $eq: req.user.id } }).populate({path: 'store'}).exec(cb);}
  }, function(err, result){


  var storetemp;
  var session = req.session;
  var depttemp;

  if (result.stores.length > 0) {
    storetemp = result.stores[0].id;
  };

  if (session.store) {
    storetemp = session.store;
  };

  if(result.dept.length > 0){
    depttemp = result.dept[0].id;
  }

  if (session.dept) {
    depttemp = session.dept;
  };

    var deptlist  = [];
    var lister    = result.lister;
    var dept      = result.dept;
    var stores    = result.stores;

    for (var i = 0; i < dept.length; i++) {
      if(dept[i].store.length >= 0){
          for (var s = 0; s < dept[i].store.length; s++) {
            if(dept[i].store[s].id.indexOf(storetemp) > -1){
              deptlist.push(dept[i]);
            }
          };
      }
    };

      res.render( 'list', {
        title         : 'Trish\'s Shopping List',
        stores        : result.stores,
        list          : result.lister,
        dept          : result.dept,
        deptmenu      : deptlist,
        selecteddept  : depttemp,
        selectedstore : storetemp,
        user          : req.user,
        message       : req.flash('message')
      });
  }); 
};


functions.changestore = function ( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
      dept: function (cb){ Dept.find({ 'created_by': { $eq: req.user.id } }).populate({path: 'store'}).exec(cb);}
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


functions.create = function ( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find({_id: req.body.store}).exec(cb);},
      lister: function (cb){ Lister.find().exec(cb);},
      dept: function (cb){ Dept.find({_id: req.body.dept}).exec(cb);}
  }, function(err, result){

    req.checkBody("productName", "Enter a valid item name.").notEmpty();
    req.checkBody("store", "Please add a store").notEmpty();
    req.checkBody("dept", "Please add a department").notEmpty();


    var errors = req.validationErrors();
    if (errors) {
      req.flash('message', errors)
      res.redirect( '/list' );
    } else {
      var session    = req.session;
      session.dept   = req.body.dept;
      new Lister({
          quantity   : req.body.quantity,
          productName: req.body.productName,
          dept       : result.dept,
          store      : result.stores,
          message    : [],
          created_by : req.user.id
      }).save( function ( err, todo, count ){
        if( err ) return next( err );
        res.redirect( '/list' );
      });
    }
  }); 

};


functions.destroy = function ( req, res, next ){
  Lister.findById( req.params.id, function ( err, lister ){
    lister.remove( function ( err, lister ) {
      if( err ) return next( err );
      res.redirect( '/list' );
    });
  });
};


functions.edit = function( req, res, next ){
  async.parallel({
      stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
      lister: function (cb){ Lister.find({ 'created_by': { $eq: req.user.id } }).populate('dept store').exec(cb);},
      dept: function (cb){ Dept.find({ 'created_by': { $eq: req.user.id } }).populate({path: 'store'}).exec(cb);}
  }, function(err, result){

    var storetemp  = result.stores[0].id;
    var deptlist   = [];
    var lister     = result.lister;
    var dept       = result.dept;
    var stores     = result.stores;
    var created_by = req.user.id;

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


functions.update = function( req, res, next ){
  Lister.findById( req.params.id, function ( err, lister ){

    lister.updated_at   = Date.now();
    lister.quantity     = req.body.quantity,
    lister.productName  = req.body.productName,
    lister.dept         = req.body.dept,
    lister.store        = req.body.store,
    lister.created_by   = req.user.id
    lister.save( function ( err, lister, count ){
      if( err ) return next( err );
      res.redirect( '/list' );
    });
  });
};


functions.stores = function( req, res){
  
  async.parallel({
      Stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
      Lister: function (cb){ Lister.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
      storeTypes: function (cb){ Settings.find({ 'setting': { $eq: 'storeTypes' } }).exec(cb);}
  }, function(err, result){
    //console.log(result.storeTypes);
      res.render( 'stores', {
        title : 'Trish\'s Shopping List',
        stores : result.Stores, 
        lister : result.Lister,
        storeTypes: result.storeTypes[0],
        message: req.flash('message')
      });

  }); 

};


functions.createstore = function ( req, res, next ){

  req.checkBody("storeName", "Enter a valid store name.").notEmpty();
  req.checkBody("storeType", "Please select a store type.").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    req.flash('message', errors)
    res.redirect( '/stores' );
  } else {
      new Stores({
      storeName   : req.body.storeName,
      address     : req.body.address,
      message     : [],
      created_by  : req.user.id
      
  }).save( function ( err, stores, count ){
    if( err ) return next( err );

    // console.log("Store: "+stores);
  async.parallel({
        Stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
        myDepts: function (cb){ Dept.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
        storeTypes: function (cb){ Settings.find({ 'setting': { $eq: 'storeTypes' } }).exec(cb);}
    }, function(err, result){

    //Settings.find({ 'setting': { $eq: 'storeTypes' } }).exec(
      //function( err, settings ){
    var settings = result.storeTypes;

        for (var i = 0; i < settings[0].types.length; i++) {
          if (settings[0].types[i].id == req.body.storeType) {
            //console.log("Found: "+settings[0].types[i]);
            for (var z = 0; z < settings[0].types[i].depts.length; z++) {
              var match = false;
              for (var q = 0; q < result.myDepts.length; q++) {
                
                if (result.myDepts[q].deptName == settings[0].types[i].depts[z].deptName) {
                  match = true;
                  result.myDepts[q].store.push(stores);
                  result.myDepts[q].save();
                  console.log("Matched: " +result.myDepts[q].deptName);
                };
              };
              if (!match) {
                new Dept({
                deptName   : settings[0].types[i].depts[z].deptName,
                store      : stores,
                message    : [],
                created_by : req.user.id
                }).save();
              };
            };
          };
        };
        res.redirect( '/stores' );
      //});//Ends Settings.find()

    });//Ends async
  });    

};
}


functions.editstore = function( req, res, next ){

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


functions.updatestore = function( req, res, next ){
  Stores.findById( req.params.id, function ( err, stores ){

    stores.storeName = req.body.storeName,
    stores.address   = req.body.address,
    stores.created_by= req.user.id,
    stores.save( function ( err, stores, count ){
      if( err ) return next( err );
      res.redirect( '/stores' );
    });
  });
};


functions.destroystore = function ( req, res, next ){
  Stores.findById( req.params.id, function ( err, stores ){
    stores.remove( function ( err, stores ){
      if( err ) return next( err );
      res.redirect( '/stores' );
    });
  });
};


functions.dept = function( req, res){
async.parallel({
    Dept: function(cb){Dept.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
    Stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);}
  },
  function(err, result){
    res.render( 'dept', {
        title   : 'Trish\'s Shopping List',
        dept: result.Dept,
        stores: result.Stores,
        message: req.flash('message')
      });

  });

};


functions.createdept = function ( req, res, next ){
    //create the object from the list of stores
    //console.log("Stores: " + req.body.storesel);
    var fetchstring = [];
    if (req.body.storesel) {
      for (var i = 0; i < req.body.storesel.length; i++) {
        fetchstring.push(req.body.storesel[i]);
      };
    };

  async.parallel({
    Stores: function (cb){ Stores.find({ '_id':{ $in: fetchstring }}).exec(cb);}
  },
  function(err, result){

  req.checkBody("deptName", "Enter a valid department name.").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    req.flash('message', errors)
    res.redirect( '/dept' );
  } else {
          new Dept({
          deptName   : req.body.deptName,
          store      : result.Stores,
          message    : [],
          created_by : req.user.id
      }).save( function ( err, dept, count ){
        if( err ) return next( err );
        res.redirect( '/dept' );
      });
  }

  });
};


functions.editdept = function( req, res, next ){
  async.parallel({
      Stores: function (cb){ Stores.find({ 'created_by': { $eq: req.user.id } }).exec(cb);},
      Dept: function (cb){ Dept.find({ 'created_by': { $eq: req.user.id } }).exec(cb);}
  }, function(err, result){
      res.render( 'editdept', {
        title : 'Trish\'s Shopping List',
        stores : result.Stores,
        dept : result.Dept,
        current : req.params.id
      });

  }); 
};


functions.updatedept = function( req, res, next ){
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
    created_by    = req.user.id;

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


functions.destroydept = function ( req, res, next ){
  Dept.findById( req.params.id, function ( err, dept ){
    dept.remove( function ( err, dept ){
      if( err ) return next( err );
      res.redirect( '/dept' );
    });
  });
};






// ** express turns the cookie key to lowercase **

functions.current_user = function ( req, res, next ){
  var user_id = req.cookies ?
      req.cookies.user_id : undefined;

  if( !user_id ){
    res.cookie( 'user_id', utils.uid( 32 ));
  }
  next();
};

return functions;
}