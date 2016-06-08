import $ from 'jquery'; // eslint-disable-line no-unused-vars
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Expenses } from '/imports/api/expenses/expenses';
import { expensesUiHooks } from './expenses';

import './archive.html';

Template.expenseArchive.helpers({
  count() {
    const filteredTagIds = Session.get('filteredTagIds') || [];

    if (filteredTagIds.length > 0) {
      return Expenses.find({ isArchived: true, tagIds: { $in: filteredTagIds } }).count();
    }

    return Expenses.find({ isArchived: true }).count();
  },
});

Template.expenseArchive.onRendered(function onRendered() {
  this.find('#js-expenses')._uihooks = expensesUiHooks;
});
