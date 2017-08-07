import { FlowRouter } from 'meteor/kadira:flow-router';
import $ from 'jquery'; // eslint-disable-line no-unused-vars
import { Template } from 'meteor/templating';

import { expensesUiHooks } from './expenses';
import filteredTagIds from '/imports/ui/filteredTagIds';
import { find } from '/imports/api/expenses/methods';

import './index.html';

Template.expenseIndex.helpers({
  expenses() {
    return find.call({ tagIds: filteredTagIds.get() });
  },
  expenseNewPath() {
    return FlowRouter.path('expense.new');
  },
});

Template.expenseIndex.onRendered(function onRendered() {
  this.find('#js-expenses')._uihooks = expensesUiHooks;
});

Template.expenseIndex.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('expenses');
    this.subscribe('tags');
  });
});
