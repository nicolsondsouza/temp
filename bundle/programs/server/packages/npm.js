(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Async, response;

(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/npm/index.js                                             //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
var Future = Npm.require('fibers/future');                           // 1
Async = {};                                                          // 2
                                                                     // 3
Meteor.require = function(moduleName) {                              // 4
  var module = Npm.require(moduleName);                              // 5
  return module;                                                     // 6
};                                                                   // 7
                                                                     // 8
Async.runSync = Meteor.sync = function(asynFunction) {               // 9
  var future = new Future();                                         // 10
  var sent = false;                                                  // 11
  var payload;                                                       // 12
                                                                     // 13
  setTimeout(function() {                                            // 14
    asynFunction(done);                                              // 15
    function done(err, result) {                                     // 16
      if(!sent) {                                                    // 17
        payload = {                                                  // 18
          result: result,                                            // 19
          error: err                                                 // 20
        };                                                           // 21
                                                                     // 22
        if(future.ret) {                                             // 23
          //for 0.6.4.1 and older                                    // 24
          future.ret();                                              // 25
        } else {                                                     // 26
          //for 0.6.5 and newer                                      // 27
          future.return();                                           // 28
        }                                                            // 29
      }                                                              // 30
    }                                                                // 31
  }, 0);                                                             // 32
                                                                     // 33
  future.wait();                                                     // 34
  sent = true;                                                       // 35
                                                                     // 36
  return payload;                                                    // 37
};                                                                   // 38
                                                                     // 39
Async.wrap = function(arg1, arg2) {                                  // 40
  if(typeof arg1 == 'function') {                                    // 41
    var func = arg1;                                                 // 42
    return wrapFunction(func);                                       // 43
  } else if(typeof arg1 == 'object' && typeof arg2 == 'string') {    // 44
    var obj = arg1;                                                  // 45
    var funcName = arg2;                                             // 46
    return wrapObject(obj, [funcName])[funcName];                    // 47
  } else if(typeof arg1 == 'object' &&  arg2 instanceof Array) {     // 48
    var obj = arg1;                                                  // 49
    var funcNameList = arg2;                                         // 50
    return wrapObject(obj, funcNameList);                            // 51
  } else {                                                           // 52
    throw new Error('unsupported argument list');                    // 53
  }                                                                  // 54
                                                                     // 55
  function wrapObject(obj, funcNameList) {                           // 56
    var returnObj = {};                                              // 57
    funcNameList.forEach(function(funcName) {                        // 58
      if(obj[funcName]) {                                            // 59
        var func = obj[funcName].bind(obj);                          // 60
        returnObj[funcName] = wrapFunction(func);                    // 61
      } else {                                                       // 62
        throw new Error('instance method not exists: ' + funcName);  // 63
      }                                                              // 64
    });                                                              // 65
    return returnObj;                                                // 66
  }                                                                  // 67
                                                                     // 68
  function wrapFunction(func) {                                      // 69
    return function() {                                              // 70
      var args = arguments;                                          // 71
      response = Meteor.sync(function(done) {                        // 72
        Array.prototype.push.call(args, done);                       // 73
        func.apply(null, args);                                      // 74
      });                                                            // 75
                                                                     // 76
      if(response.error) {                                           // 77
        throw response.error;                                        // 78
      } else {                                                       // 79
        return response.result;                                      // 80
      }                                                              // 81
    };                                                               // 82
  }                                                                  // 83
};                                                                   // 84
                                                                     // 85
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.npm = {
  Async: Async
};

})();
