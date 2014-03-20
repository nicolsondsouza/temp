(function(){__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var CSV, Future, _searchAmazon;

Future = Meteor.require('fibers/future');

CSV = Meteor.require('csv');

Meteor.Router.add('/listings/export', function() {
  var fut, properties, res,
    _this = this;
  fut = new Future();
  this.response.setHeader('Content-Disposition', 'attachment; filename=listings.csv;');
  properties = ['sku', 'product-id', 'product-id-type', 'price', 'item-condition', 'quantity', 'add-delete', 'will-ship-internationally', 'expedited-shipping', 'standard-plus', 'item-note', 'fulfillment-center-id', 'product-tax-code', 'leadtime-to-ship'];
  res = Listings.find().map(function(listing) {
    return _.map(properties, function(name) {
      if (name === 'sku') {
        return listing.computeSKU();
      }
      if (name === 'product-id') {
        return listing.asin;
      }
      if (name === 'product-id-type') {
        return 1;
      }
      if (name === 'price') {
        return listing.price;
      }
      if (name === 'item-condition') {
        return 11;
      }
      if (name === 'quantity') {
        return 40;
      }
      if (name === 'add-delete') {
        return 'a';
      }
      if (name === 'will-ship-internationally') {
        return 'y';
      }
      if (name === 'expedited-shipping') {
        return 'Next, Second, Domestic, International';
      }
      if (name === 'leadtime-to-ship') {
        return 1;
      }
      if (name === 'item-note') {
        return 'Brand New Compatible Battery, Superior Tech Rover Quality, 30-Day Any Reason Return Policy with Unmatched Tech Rover Customer Service! Buy with confidence from a knowledgeable US seller you can trust.';
      }
      return '';
    });
  });
  res.unshift(properties);
  CSV().from(res).to(this.response).on('end', function() {
    _this.response.end();
    return fut["return"]();
  });
  return fut.wait();
});

_searchAmazon = function(loadId, keywords, pages) {
  var asins, _i, _results;
  if (pages == null) {
    pages = 2;
  }
  asins = _((function() {
    _results = [];
    for (var _i = 1; 1 <= pages ? _i <= pages : _i >= pages; 1 <= pages ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this)).chain().map(function(page) {
    return scrapAmazonSearch.future()(keywords, page);
  }).tap(function(futures) {
    return Future.wait(futures);
  }).map(function(future) {
    return future.get();
  }).flatten().map(function(product) {
    Product.upsert({
      asin: product.asin
    }, product, function() {
      return Loads.update(loadId, {
        $inc: {
          productProcessed: 1
        }
      });
    });
    return product.asin;
  }).value();
  return Query.upsert({
    keywords: keywords
  }, {
    keywords: keywords,
    matched_asins: asins
  }, function() {
    return Loads.update(loadId, {
      $inc: {
        keywordsProcessed: 1
      }
    });
  });
};

Meteor.methods({
  doLoad: function(keywordsAmount) {
    return Loads.insert({
      keywordsAmount: keywordsAmount,
      keywordsProcessed: 0,
      productProcessed: 0,
      ownerId: Meteor.userId(),
      createdAt: new Date()
    });
  },
  saveLoad: function(loadId, name) {
    var load;
    load = Loads.findOne(loadId);
    return Results.insert({
      name: name,
      ownerId: Meteor.userId(),
      productIds: load.productIds
    });
  },
  searchAmazon: function(loadId, keywordsList, pages) {
    var ordering, productIds, products, queries, query, queryIds, _i, _len;
    if (pages == null) {
      pages = 2;
    }
    queryIds = _.chain(keywordsList).map(function(keywords, index) {
      return _searchAmazon.future()(loadId, keywords, pages);
    }).tap(function(results) {
      return Future.wait(_.filter(results, function(result) {
        return result instanceof Future;
      }));
    }).map(function(result) {
      if (result instanceof Future) {
        return result.get();
      } else {
        return result;
      }
    }).value();
    queries = Queries.find({
      _id: {
        $in: queryIds
      }
    }).fetch();
    products = Query.allMatchedProducts(queries).fetch();
    ordering = {};
    for (_i = 0, _len = queries.length; _i < _len; _i++) {
      query = queries[_i];
      _.each(query.matched_asins, function(asin, index) {
        if (ordering[asin] === void 0 || ordering[asin] > index) {
          return ordering[asin] = index;
        }
      });
    }
    products = _.sortBy(products, function(product) {
      return ordering[product.asin];
    });
    productIds = _.map(products, function(product) {
      return product._id;
    });
    return Loads.update(loadId, {
      $set: {
        productIds: productIds
      }
    });
  },
  getDetails: function(product_id) {
    var details, product;
    product = Products.findOne(product_id);
    if (!product.hasDetails()) {
      details = scrapAmazonProduct(product.asin);
      Products.update({
        _id: product_id
      }, {
        $set: details
      });
      return Products.findOne(product_id);
    }
  },
  listProduct: function(productId, price, baseSKU, original) {
    var product;
    if (!Listings.findOne({
      productId: productId
    })) {
      product = Products.findOne(productId);
      if (product) {
        return product.createListing(price, baseSKU, original);
      }
    }
  }
});

Accounts.validateNewUser(function(user) {
  if (user.username === 'tony' || user.username === 'brian') {
    return true;
  }
});

})();
