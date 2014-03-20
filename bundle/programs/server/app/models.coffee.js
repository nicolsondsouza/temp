(function(){__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Model, _ref, _ref1, _ref2, _ref3, _ref4,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = (function(_super) {
  __extends(Model, _super);

  function Model() {
    _ref = Model.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Model.upsert = function(selector, modifier, callback) {
    var obj;
    obj = this.collection().findOne(selector);
    if (obj) {
      this.collection().update(selector, modifier, callback);
      return obj._id;
    } else {
      return this.collection().insert(modifier, callback);
    }
  };

  return Model;

})(MiniModel);

this.Products = new Meteor.Collection('products', {
  transform: function(doc) {
    return new Product(doc);
  }
});

this.Product = (function(_super) {
  __extends(Product, _super);

  function Product() {
    _ref1 = Product.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  Product.collectionName = 'Products';

  Product.prototype.hasDetails = function() {
    return this.technicalDetails || this.seller || this.productDetails;
  };

  Product.prototype.createListing = function(price, baseSKU, original) {
    var baseSKUCount, lister;
    if (original == null) {
      original = false;
    }
    lister = Seller.getOrCreate(this.seller.id, this.seller);
    baseSKUCount = Listings.find({
      baseSKU: baseSKU
    }).count();
    return Listings.insert({
      productId: this._id,
      asin: this.asin,
      price: price,
      status: 'Active',
      quantity: 99,
      condition: 'New',
      baseSKU: baseSKU,
      skuSuffix: baseSKUCount,
      original: original,
      lister: {
        name: lister.name,
        code: lister.code
      }
    });
  };

  return Product;

})(Model);

this.Queries = new Meteor.Collection('queries', {
  transform: function(doc) {
    return new Query(doc);
  }
});

this.Query = (function(_super) {
  __extends(Query, _super);

  function Query() {
    _ref2 = Query.__super__.constructor.apply(this, arguments);
    return _ref2;
  }

  Query.collectionName = 'Queries';

  Query.prototype.matchedProducts = function() {
    return Products.find({
      asin: {
        $in: this.matched_asins
      }
    });
  };

  Query.allMatchedProducts = function(queries) {
    return Products.find({
      asin: {
        $in: _.chain(queries).pluck('matched_asins').flatten().union().value()
      }
    });
  };

  return Query;

})(Model);

this.Listings = new Meteor.Collection('listings', {
  transform: function(doc) {
    return new Listing(doc);
  }
});

this.Listing = (function(_super) {
  __extends(Listing, _super);

  function Listing() {
    _ref3 = Listing.__super__.constructor.apply(this, arguments);
    return _ref3;
  }

  Listing.collectionName = 'Listings';

  Listing.prototype.computeSKU = function() {
    var sku, _ref4;
    if (this.sku) {
      return this.sku;
    }
    sku = "" + this.baseSKU + "_CX" + ((_ref4 = this.lister) != null ? _ref4.code : void 0) + "_" + this.skuSuffix;
    if (this.original) {
      sku = "" + sku + "_OG";
    }
    return sku;
  };

  return Listing;

})(Model);

this.Sellers = new Meteor.Collection('sellers', {
  transform: function(doc) {
    return new Listing(doc);
  }
});

this.Seller = (function(_super) {
  __extends(Seller, _super);

  function Seller() {
    _ref4 = Seller.__super__.constructor.apply(this, arguments);
    return _ref4;
  }

  Seller.collectionName = 'Sellers';

  Seller.getOrCreate = function(id, attributes) {
    var code, obj, _id;
    _id = Seller.upsert({
      id: id
    }, attributes);
    obj = Sellers.findOne(_id);
    if (!obj.code) {
      code = this.collection().findOne({}, {
        sort: {
          code: -1
        }
      }).code || 1;
      obj.code = code + 1;
      this.collection().update(_id, obj);
    }
    return obj;
  };

  return Seller;

})(Model);

this.Loads = new Meteor.Collection('loads');

this.Results = new Meteor.Collection('results');

})();
