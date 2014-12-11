Handlebars.registerHelper('moment', function (context, options) {

  return new Handlebars.SafeString(moment(context).format(options.hash.format));

});

Handlebars.registerHelper('currency', function (context) {

  return new Handlebars.SafeString('£' + (context / 100).toFixed(2));

});

Handlebars.registerHelper('capitalise', function (context) {

  return new Handlebars.SafeString(context.split('')[0].toUpperCase() + context.substring(1));

});
