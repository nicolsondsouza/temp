(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var __coffeescriptShare;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/mini-models/lib/mini-models.coffee.js                                             //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
this.MiniModel = (function() {
  MiniModel.collection = function() {
    return this._collection || (this._collection = eval(this.collectionName));
  };

  MiniModel.hasErrors = function(options) {
    return !_.isEmpty(this.getErrors(options));
  };

  MiniModel.getErrors = function(options) {
    var allErrors;
    if (!_.isObject(options)) {
      options = {
        field: options
      };
    }
    allErrors = Session.get("" + this.collectionName + ":errors:" + options.uuid) || {};
    if (options.field) {
      return allErrors[options.field] || [];
    }
    return allErrors;
  };

  MiniModel.setErrors = function(options) {
    options.errors || (options.errors = {});
    return Session.set("" + this.collectionName + ":errors:" + options.uuid, options.errors);
  };

  function MiniModel(doc) {
    _.extend(this, doc);
  }

  MiniModel.prototype.isValid = function() {
    var _this = this;
    this.setErrors({});
    _.each(this.__proto__.constructor.validations, function(validationRule) {
      return _.each(validationRule, function(validation, field) {
        var message, rule;
        _this[field] || (_this[field] = null);
        rule = validation.rule || validation;
        message = validation.message;
        if (_.isString(rule) && _.isFunction(_this[rule])) {
          if (!message) {
            message = field + " " + rule;
          }
          if (!_this[rule](_this[field])) {
            return _this.addError(field, message);
          }
        } else if (_.isArray(rule) && _this[rule[0]]) {
          if (!message) {
            message = field + " " + rule[0] + " " + rule[1];
          }
          if (!_this[rule[0]](_this[field], rule[1])) {
            return _this.addError(field, message);
          }
        } else if (_.isFunction(rule)) {
          if (!message) {
            message = field + " error";
          }
          if (!rule(_this[field])) {
            return _this.addError(field, message);
          }
        }
      });
    });
    if (_.isEmpty(this.getErrors())) {
      return true;
    }
    return false;
  };

  MiniModel.prototype.hasErrors = function(field) {
    return this.__proto__.constructor.hasErrors({
      uuid: this._id,
      field: field
    });
  };

  MiniModel.prototype.getErrors = function(field) {
    return this.__proto__.constructor.getErrors({
      uuid: this._id,
      field: field
    });
  };

  MiniModel.prototype.setErrors = function(errors) {
    return this.__proto__.constructor.setErrors({
      uuid: this._id,
      errors: errors
    });
  };

  MiniModel.prototype.addError = function(field, message) {
    var errors;
    errors = this.getErrors();
    errors[field] || (errors[field] = []);
    errors[field].push(message);
    return this.setErrors(errors);
  };

  MiniModel.prototype.notEmpty = function(fieldValue) {
    if (_.isEmpty(fieldValue)) {
      return false;
    }
    return true;
  };

  MiniModel.prototype.maxLength = function(fieldValue, length) {
    if (!_.isString(fieldValue)) {
      return false;
    }
    if (fieldValue.length > length) {
      return false;
    }
    return true;
  };

  MiniModel.prototype.minLength = function(fieldValue, length) {
    if (!_.isString(fieldValue)) {
      return false;
    }
    if (fieldValue.length < length) {
      return false;
    }
    return true;
  };

  MiniModel.prototype.save = function() {
    var data;
    if (!this.isValid()) {
      return false;
    }
    this._applyCallback("beforeSave");
    data = _.extend({}, this);
    if (data._id) {
      delete data._id;
      this.__proto__.constructor.collection().update(this._id, data);
    } else {
      this._id = this.__proto__.constructor.collection().insert(data);
    }
    return this._applyCallback("afterSave");
  };

  MiniModel.prototype.destroy = function() {
    this._applyCallback("beforeDestroy");
    this.__proto__.constructor.collection().remove(this._id);
    return this._applyCallback("afterDestroy");
  };

  MiniModel.prototype._applyCallback = function(callback) {
    var _this = this;
    return _.each(this.__proto__.constructor[callback] || [], function(cbck) {
      return cbck(_this);
    });
  };

  return MiniModel;

})();
////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['mini-models'] = {};

})();
