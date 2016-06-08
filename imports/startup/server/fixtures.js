import faker from 'faker';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import sample from 'lodash.sample';
import times from 'lodash.times';

import { Expenses } from '/imports/api/expenses/expenses';
import { insert } from '/imports/api/expenses/methods';
import utils from '/imports/ui/utils';

Meteor.startup(() => {
  const count = Expenses.find({}).count();
  const minimum = 9;
  const difference = minimum - count;

  if (difference <= 0) {
    return;
  }

  times(difference, () => {
    insert.call({
      amount: Math.round(Math.random() * 1000),
      note: faker.commerce.product(),
      location: faker.company.companyName(),
      date: moment().subtract(Math.round(Math.random() * 365), 'days')
                    .hour(sample(Object.keys(utils.getTimes())))
                    .toDate(),
      tagNames: times(Math.round(Math.random() * 6), () => faker.commerce.department()),
    });
  });
});
