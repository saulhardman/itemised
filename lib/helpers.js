Handlebars.registerHelper('moment', function (context, options) {

  return new Handlebars.SafeString(moment(context).format(options.hash.format));

});

Handlebars.registerHelper('parseCurrency', function (context) {

  return new Handlebars.SafeString(utils.parseCurrency(context));

});

Handlebars.registerHelper('parseAmount', function (context) {

  return new Handlebars.SafeString(utils.parseAmount(context));

});

Handlebars.registerHelper('capitalise', function (context) {

  return new Handlebars.SafeString(utils.capitalise(context));

});

Handlebars.registerHelper('prettyName', function (context) {

  return new Handlebars.SafeString(utils.prettyName(context));

});
