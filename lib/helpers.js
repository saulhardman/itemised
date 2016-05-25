Handlebars.registerHelper('moment', function (context, options) {
  return new Handlebars.SafeString(moment(context).format(options.hash.format));
});

Handlebars.registerHelper('parseCurrency', function (context) {
  return new Handlebars.SafeString(utils.parseCurrency(context));
});

Handlebars.registerHelper('parseAmount', function (context) {
  return new Handlebars.SafeString(utils.parseAmount(context));
});

UI.registerHelper('selected', function (context) {
  return context ? 'selected' : '';
});
