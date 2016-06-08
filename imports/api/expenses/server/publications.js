import { Meteor } from 'meteor/meteor';

import { Expenses } from '/imports/api/expenses/expenses';

Meteor.publish('expenses', () => Expenses.find());
