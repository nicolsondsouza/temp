(function(){__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Future, URI, parseFloatStr, parseIntStr, scrap;

Future = Meteor.require('fibers/future');

URI = Meteor.require('URIjs');

scrap = Future.wrap(Meteor.require('scrap'));

parseFloatStr = function(str) {
  var matched;
  matched = str ? _.first(str.match(/[0-9\.]+/)) : null;
  if (matched) {
    return parseFloat(matched);
  } else {
    return null;
  }
};

parseIntStr = function(str) {
  var matched;
  matched = str ? _.first(str.match(/\d+/)) : null;
  if (matched) {
    return parseInt(matched);
  } else {
    return null;
  }
};

this.scrapAmazonSearch = function(query, page) {
  var $, url;
  if (page == null) {
    page = 1;
  }
  console.log("Scraping Amazon: " + query + " page: " + page);
  url = "http://www.amazon.com/s/?rh=n:720576&field-keywords=" + (query.split(' ').join('+')) + "&page=" + page;
  $ = scrap(url).wait();
  return $('div.prod').map(function() {
    return {
      rank: parseIntStr($(this).attr('id')),
      asin: $(this).attr('name'),
      url: $(this).find('h3 a').attr('href'),
      title: $(this).find('h3 a span').attr('title') || $(this).find('h3 a span').text(),
      imageUrl: $(this).find('.image img').attr('src'),
      price: parseFloatStr($(this).find('li.newp span').text()),
      rating: parseFloatStr($(this).find('.asinReviewsSummary a').attr('alt')),
      reviewsCount: parseIntStr($(this).find('.rvwCnt a').text()),
      sellersCount: parseIntStr($(this).find('.med.mkp2 a[href*=new] .grey').text())
    };
  });
};

this.scrapAmazonProduct = function(asin) {
  var $, manufacturerLink, manufacturerPath, productDetailsDiv, sellerLink, sellerPath, url;
  console.log("Scraping Amazon Product: " + asin);
  url = "http://www.amazon.com/dp/" + asin;
  $ = scrap(url).wait();
  productDetailsDiv = $('#detail-bullets').clone();
  productDetailsDiv.find('script,style').remove();
  sellerLink = $('#handleBuy table .buying:not([id]) > b a');
  sellerPath = URI(sellerLink.attr('href'));
  manufacturerLink = $('#handleBuy > .buying a');
  manufacturerPath = URI(manufacturerLink.attr('href'));
  return {
    asin: asin,
    seller: {
      name: sellerLink.text().trim(),
      url: sellerPath.absoluteTo('http://www.amazon.com/').toString(),
      id: sellerPath.search(true).seller
    },
    manufacturer: {
      name: manufacturerLink.text().trim(),
      url: manufacturerPath.absoluteTo('http://www.amazon.com/').toString()
    },
    technicalDetails: $('#technical-data .content ul li').map(function() {
      return $(this).text().trim();
    }),
    productDetails: productDetailsDiv.find('.content > ul > li').map(function() {
      return $(this).text().replace(/\s+/g, ' ').trim();
    }),
    productDescription: $('#productDescription .productDescriptionWrapper').text().trim()
  };
};

})();
