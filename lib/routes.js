Router.configure({
  loadingTemplate: 'loading'
});

Router.route('/', function () {
  Router.go('/expenses');
});

Router.route('/expenses/add', {
  template: 'addExpense',
});

ExpensesController = RouteController.extend({
  template: 'expensesList',
  waitOn: function () {
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
  expenses: function(tagNames, tagIds, selector) {
    return Expenses.find(selector, { sort: { date: -1 } }).map(function (expense) {
      expense.tags = expense.tagIds.map(function (tagId) {
        var tag = Tags.findOne(tagId);

        if (tagIds.indexOf(tagId) > -1) {
          tag.selected = true;
          tag.href = '/expenses/' + _.without(tagNames, tag.name).join('/');
        } else {
          tag.href = '/expenses/' + tagNames.concat([tag.name]).join('/');
        }

        return tag;
      });

      return expense;
    });
  },
  data: function() {
    if (!this.ready()) {
      return;
    }

    var tagNames = _.compact(this.params[0].split('/'));
    var tagIds = [];
    var selector;

    if (tagNames.length > 0) {
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
    };
  }
});

Router.route('/expenses(.*)', {
  name: 'expensesList',
  controller: ExpensesController
});
