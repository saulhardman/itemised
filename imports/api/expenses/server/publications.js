import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Expenses } from '/imports/api/expenses/expenses';

Meteor.publish('expenses', () => Expenses.find());

Meteor.publish('singleExpense', (expenseId) => {
  check(expenseId, String);

  return Expenses.find({ _id: expenseId });
});
