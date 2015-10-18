Router.configure({
  loadingTemplate: 'loading',
  layoutTemplate: 'layout',
});

Router.route('/', function () {
  this.redirect('/expenses');
});

Router.route('/expenses/new', {
  name: 'expense.new',
  waitOn() {
    return Meteor.subscribe('tags');
  },
  data() {
    if (!this.ready()) {
      return;
    }

    return {
      tags: Tags.find({}, { sort: { count: -1 } }),
    };
  },
});

ExpenseController = RouteController.extend({
  waitOn() {
    return [
      Meteor.subscribe('expenses'),
      Meteor.subscribe('tags'),
    ];
  },
  expense() {
    var expense = Expenses.findOne(this.params._id);
    var date = expense.date;

    expense.tagNames = expense.tags.map(function (tag) {
      return tag.prettyName;
    }).join(', ');

    return expense;
  },
  data() {
    if (!this.ready()) {
      return;
    }

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

ExpensesController = RouteController.extend({
  waitOn() {
    return [
      Meteor.subscribe('expenses'),
      Meteor.subscribe('tags')
    ];
  },
  totals(selector) {
    return [
      {
        name: 'today',
        title: 'Today',
        amount: Expenses.find(_.extend({
          date: {
            $gte: utils.getToday()
          }
        }, selector), {
          fields: {
            amount: 1
          }
        }).fetch().reduce(function (total, expense) {
          return total + parseInt(expense.amount, 10);
        }, 0)
      },
      {
        name: 'weekly',
        title: 'This Week',
        amount: Expenses.find(_.extend({
          date: {
            $gte: utils.getFirstDayOfTheWeek(),
            $lt: utils.getLastDayOfTheWeek(),
          }
        }, selector), {
          fields: {
            amount: 1
          }
        }).fetch().reduce(function (total, expense) {
          return total + parseInt(expense.amount, 10);
        }, 0)
      },
      {
        name: 'monthly',
        title: 'This Month',
        amount: Expenses.find(_.extend({
          date: {
            $gte: utils.getFirstDayOfTheMonth(),
            $lt: utils.getLastDayOfTheMonth(),
          }
        }, selector), {
          fields: {
            amount: 1
          }
        }).fetch().reduce(function (total, expense) {
          return total + parseInt(expense.amount, 10);
        }, 0)
      },
      {
        name: 'yearly',
        title: 'This Year',
        amount: Expenses.find(_.extend({
          date: {
            $gte: utils.getFirstDayOfTheYear(),
            $lt: utils.getLastDayOfTheYear(),
          }
        }, selector), {
          fields: {
            amount: 1
          }
        }).fetch().reduce(function (total, expense) {
          return total + parseInt(expense.amount, 10);
        }, 0)
      },
      {
        name: 'total',
        title: 'All Time',
        amount: Expenses.find(selector, {
          fields: {
            amount: 1
          }
        }).fetch().reduce(function (total, expense) {
          return total + parseInt(expense.amount, 10);
        }, 0)
      },
    ];
  },
  expenses(selector, options) {
    return Expenses.find(selector, options);
  },
  data() {
    if (!this.ready()) {
      return;
    }

    var tagIds = this.params.query.tagIds || Session.get('filteredTagIds') || [];
    var selector = { isDeleted: false };
    var options = { sort: { date: -1 } };

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

ArchiveController = ExpensesController.extend({
  data() {
    if (!this.ready()) {
      return;
    }

    var tagIds = this.params.query.tagIds || Session.get('filteredTagIds') || [];
    var selector = { isDeleted: true };
    var options = { sort: { deletedAt: -1 } };

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
