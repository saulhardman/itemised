import $ from 'jquery'; // eslint-disable-line no-unused-vars
import { Template } from 'meteor/templating';

import { expensesUiHooks } from './expenses';
import filteredTagIds from '/imports/ui/filteredTagIds';
import { findArchived } from '/imports/api/expenses/methods';

import './archive.html';

Template.expenseArchive.helpers({
  expenses() {
    return findArchived.call({ tagIds: filteredTagIds.get() });
  },
});

Template.expenseArchive.onRendered(function onRendered() {
  this.find('#js-expenses')._uihooks = expensesUiHooks;
});

Template.expenseArchive.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('expenses');
    this.subscribe('tags');
  });
});
