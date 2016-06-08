import { Template } from 'meteor/templating';
import moment from 'moment';

import utils from '/imports/ui/utils';

Template.registerHelper('moment', (context, options) =>
  moment(context).format(options.hash.format)
);

Template.registerHelper('parseCurrency', (context) => utils.parseCurrency(context));

Template.registerHelper('parseAmount', (context) => utils.parseAmount(context));

Template.registerHelper('selected', (context) => {
  if (context) {
    return 'selected';
  }

  return '';
});
