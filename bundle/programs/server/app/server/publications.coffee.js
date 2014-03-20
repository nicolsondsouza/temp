(function(){__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
Meteor.publish('productsMatchingLoadId', function(loadId) {
  var load;
  load = Loads.findOne(loadId);
  return Products.find({
    _id: {
      $in: load.productIds
    }
  });
});

Meteor.publish('productsMatchingResults', function(resultsIds) {
  return Products.find({
    _id: {
      $in: resultsIds
    }
  });
});

Meteor.publish('allQeries', function() {
  return Queries.find();
});

Meteor.publish('allListings', function() {
  return Listings.find();
});

Meteor.publish('allSellers', function() {
  return Sellers.find();
});

Meteor.publish('allLoads', function() {
  return Loads.find({
    ownerId: this.userId
  });
});

Meteor.publish('allResults', function() {
  return Results.find({
    ownerId: this.userId
  });
});

})();
