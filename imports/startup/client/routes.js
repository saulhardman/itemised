import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Router, RouteController } from 'meteor/iron:router';
import { Expenses } from '/imports/api/expenses/expenses';
import { Tags } from '/imports/api/tags/tags';

import utils from '/imports/ui/utils';

// Components
import '/imports/ui/components/expense/expense';
import '/imports/ui/components/icons/icons';
import '/imports/ui/components/notification/notification';
import '/imports/ui/components/tag/tag';
import '/imports/ui/components/totals/totals';
import '/imports/ui/components/undo/undo';

// Layouts
import '/imports/ui/templates/expenses/archive';
import '/imports/ui/templates/expenses/edit';
import '/imports/ui/templates/expenses/index';
import '/imports/ui/templates/expenses/new';
import '/imports/ui/templates/header/header';
import '/imports/ui/templates/layout/layout';
import '/imports/ui/templates/loading/loading';
import '/imports/ui/templates/notifications/notifications';

Router.configure({
  loadingTemplate: 'loading',
  layoutTemplate: 'layout',
});

Router.route('/', function redirectToExpenses() {
  this.redirect('/expenses');
});

Router.route('/expenses/new', {
  name: 'expense.new',
  waitOn() {
    return Meteor.subscribe('tags');
  },
  data() {
    return {
      tags: Tags.find({}, { sort: { count: -1 } }),
    };
  },
});

const ExpenseController = RouteController.extend({
  waitOn() {
    return [
      Meteor.subscribe('expenses'),
      Meteor.subscribe('tags'),
    ];
  },
  expense() {
    const expense = Expenses.findOne(this.params._id);

    expense.tagNames = expense.tags.map((tag) => tag.prettyName).join(', ');

    return expense;
  },
  data() {
    return {
      expense: this.expense(),
      tags: Tags.find({}, { sort: { count: -1 } }),
    };
  },
});

Router.route('/expenses/:_id/edit', {
  name: 'expense.edit',
  controller: ExpenseController,
});

const ExpensesController = RouteController.extend({
  waitOn() {
    return [
      Meteor.subscribe('expenses'),
      Meteor.subscribe('tags'),
    ];
  },
  totals(selector) {
    return [
      {
        name: 'today',
        title: 'Today',
        amount: Expenses.find(Object.assign({
          date: {
            $gte: utils.getToday(),
          },
        }, selector), {
          fields: {
            amount: 1,
          },
        }).fetch().reduce((total, expense) => total + parseInt(expense.amount, 10), 0),
      },
      {
        name: 'weekly',
        title: 'This Week',
        amount: Expenses.find(Object.assign({
          date: {
            $gte: utils.getFirstDayOfTheWeek(),
            $lt: utils.getLastDayOfTheWeek(),
          },
        }, selector), {
          fields: {
            amount: 1,
          },
        }).fetch().reduce((total, expense) => total + parseInt(expense.amount, 10), 0),
      },
      {
        name: 'monthly',
        title: 'This Month',
        amount: Expenses.find(Object.assign({
          date: {
            $gte: utils.getFirstDayOfTheMonth(),
            $lt: utils.getLastDayOfTheMonth(),
          },
        }, selector), {
          fields: {
            amount: 1,
          },
        }).fetch().reduce((total, expense) => total + parseInt(expense.amount, 10), 0),
      },
      {
        name: 'yearly',
        title: 'This Year',
        amount: Expenses.find(Object.assign({
          date: {
            $gte: utils.getFirstDayOfTheYear(),
            $lt: utils.getLastDayOfTheYear(),
          },
        }, selector), {
          fields: {
            amount: 1,
          },
        }).fetch().reduce((total, expense) => total + parseInt(expense.amount, 10), 0),
      },
      {
        name: 'total',
        title: 'All Time',
        amount: Expenses.find(selector, {
          fields: {
            amount: 1,
          },
        }).fetch().reduce((total, expense) => total + parseInt(expense.amount, 10), 0),
      },
    ];
  },
  expenses(selector, options) {
    return Expenses.find(selector, options);
  },
  data() {
    const tagIds = this.params.query.tagIds || Session.get('filteredTagIds') || [];
    const selector = { isArchived: false };
    const options = { sort: { date: -1 } };

    if (tagIds.length) {
      selector.tagIds = { $in: tagIds };
    }

    return {
      expenses: this.expenses(selector, options),
      totals: this.totals(selector),
    };
  },
});

Router.route('/expenses', {
  name: 'expense.index',
  controller: ExpensesController,
});

const ArchiveController = ExpensesController.extend({
  data() {
    const tagIds = this.params.query.tagIds || Session.get('filteredTagIds') || [];
    const selector = { isArchived: true };
    const options = { sort: { archivedAt: -1 } };

    if (tagIds.length) {
      selector.tagIds = { $in: tagIds };
    }

    return {
      expenses: this.expenses(selector, options),
      totals: this.totals(selector),
    };
  },
});

Router.route('/archive', {
  name: 'expense.archive',
  controller: ArchiveController,
});
