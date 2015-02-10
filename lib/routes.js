Router.configure({
  loadingTemplate: 'loading'
});

Router.route('/', function () {
  this.redirect('/expenses');
});

Router.route('/expenses/new', {
  name: 'expense.new',
  waitOn: function waitOn() {  
    return Meteor.subscribe('tags');
  },
  data: function data() {
    if (!this.ready()) {
      return;
    }

    return {
      tags: Tags.find({}, { sort: { count: -1 } }),
    };
  },
});

ExpenseController = RouteController.extend({
  waitOn: function waitOn() {
    return [
      Meteor.subscribe('expense', this.params._id),
      Meteor.subscribe('tags'),
    ];
  },
  expense: function expense() {
    var thisExpense = Expenses.findOne(this.params._id);
    var date = thisExpense.date;

    thisExpense.tags = thisExpense.tagIds.map(function (tagId) {
      return utils.prettyName(Tags.findOne(tagId, {}, { name: 1 }).name);
    }).join(', ');

    thisExpense.date = utils.getDate(date);
    thisExpense.time = utils.getTime(date);
  
    return thisExpense;
  },
  data: function data() {
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
  waitOn: function waitOn() {
    return [
      Meteor.subscribe('expenses', { sort: { date: -1 } }),
      Meteor.subscribe('tags')
    ];
  },
  totals: function totals(selector) {  
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
  expenses: function expenses(tagNames, tagIds, selector) {
    return Expenses.find(selector, { sort: { date: -1 } }).map(function (expense) {
      expense.tags = expense.tagIds.map(function (tagId) {
        var tag = Tags.findOne(tagId);

        if (tagIds.indexOf(tagId) !== -1) {
          tag.selected = true;
          tag.href = '/expenses/' + _.without(tagNames, tag.name).join('/');
        } else {
          tag.selected = false;
          tag.href = '/expenses/' + tagNames.concat([tag.name]).join('/');
        }

        return tag;
      });

      return expense;
    });
  },
  data: function data() {
    if (!this.ready()) {
      return;
    }

    var tagNames = _.compact(this.params[0].split('/'));
    var tagIds = [];
    var selector;

    if (tagNames.length !== 0) {
      tagIds = tagNames.map(function (tagName) {
        var tag = Tags.findOne({ name: tagName });

        if (tag) {
          return tag._id;
        }
      });

      selector = {
        isDeleted: false,
        tagIds: { $in: tagIds },
      };
    } else {
      selector = {
        isDeleted: false,
      };
    }

    return {
      expenses: this.expenses(tagNames, tagIds, selector),
      totals: this.totals(selector),
      tags: tagNames,
    };
  }
});

Router.route('/expenses(.*)', {
  name: 'expense.index',
  controller: ExpensesController
});
