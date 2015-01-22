Handlebars.registerHelper('moment', function (context, options) {

  return new Handlebars.SafeString(moment(context).format(options.hash.format));

});

Handlebars.registerHelper('currency', function (context) {

  return new Handlebars.SafeString('£' + (context / 100).toFixed(2));

});

Handlebars.registerHelper('capitalise', function (context) {

  return new Handlebars.SafeString(utils.capitalise(context));

});

Handlebars.registerHelper('prettyName', function (context) {

  return new Handlebars.SafeString(utils.capitalise(context.split('-').join(' ')));

});
