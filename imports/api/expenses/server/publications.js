import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Expenses } from '/imports/api/expenses/expenses';

Meteor.publish('expenses', () => Expenses.find());

Meteor.publish('singleExpense', (expenseId) => {
  check(expenseId, Meteor.Collection.ObjectID);

  return Expenses.find({ _id: expenseId });
});
