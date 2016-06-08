import $ from 'jquery'; // eslint-disable-line no-unused-vars
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Expenses } from '/imports/api/expenses/expenses';
import { expensesUiHooks } from './expenses';

import './index.html';

Template.expenseIndex.helpers({
  count() {
    const filteredTagIds = Session.get('filteredTagIds') || [];

    if (filteredTagIds.length > 0) {
      return Expenses.find({ isArchived: false, tagIds: { $in: filteredTagIds } }).count();
    }

    return Expenses.find({ isArchived: false }).count();
  },
});

Template.expenseIndex.onRendered(function onRendered() {
  this.find('#js-expenses')._uihooks = expensesUiHooks;
});
