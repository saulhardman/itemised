// Router.route('/', function () {
//   var expenses = Expenses.all().fetch();
//   var tagCounts = Expenses.tagCounts();
//   var totals = Expenses.totals();

//   expenses.forEach(function (value) {
//     value.tags = value.tags.map(function (value) {
//       return {
//         name: value,
//         count: tagCounts[value],
//         href: '/expenses/' + value
//       };
//     });
//   });

//   console.log('Expenses: ', expenses, totals);

//   this.render('dashboard', {
//     data: {
//       expenses: expenses,
//       totals: totals,
//     }
//   });
// });

// Router.route('/expenses/add', function () {
//   this.render('addExpense');
// });

// Router.route('/expenses/(.*)', function () {
//   var tags = this.params[0].split('/');
//   var selector = { tags: { $in: tags } };
//   var expenses = Expenses.all(selector).fetch();
//   var tagCounts = Expenses.tagCounts();
//   var totals = Expenses.totals(selector);

//   expenses.forEach(function (value) {
//     value.tags = value.tags.map(function (value) {
//       var selected = tags.indexOf(value) > -1;
//       var href = selected ? '/expenses/' + tags.filter(function (tag) { return tag !== value; }).join('/') : '/expenses/' + tags.concat([value]).join('/');

//       if (href === '/expenses/') {
//         href = '/';
//       }

//       return {
//         name: value,
//         count: tagCounts[value],
//         selected: selected,
//         href: href,
//       };
//     });
//   });

//   console.log('Expenses:', expenses.length, expenses);

//   this.render('dashboard', {
//     data: {
//       expenses: expenses,
//       totals: totals,
//     }
//   });
// });

// Expenses = {
//   defaultSelector: {
//     isDeleted: false,
//   },
//   daily: function daily(selector, options) {
//     selector = _.extend({ date: { $gte: utils.getToday() } }, this.defaultSelector, selector);
//     options = _.extend({ sort: { date: -1 } }, options);

//     return this.collection.find(selector, options);
//   },
//   dailyTotal: function dailyTotal(selector) {
//     return utils.accumulator(this.daily(selector, { fields: { amount: 1 } }).fetch(), 'amount');
//   },
//   weekly: function weekly(selector, options) {
//     selector = _.extend({
//       date: {
//         $gte: utils.getFirstDayOfTheWeek(),
//         $lt: utils.getLastDayOfTheWeek(),
//       }
//     }, this.defaultSelector, selector);
//     options = _.extend({ sort: { date: -1 } }, options);

//     return this.collection.find(selector, options);
//   },
//   weeklyTotal: function weeklyTotal(selector) {
//     return utils.accumulator(this.weekly(selector, { fields: { amount: 1 } }).fetch(), 'amount');
//   },
//   monthly: function monthly(selector, options) {
//     selector = _.extend({
//       date: {
//         $gte: utils.getFirstDayOfTheMonth(),
//         $lt: utils.getLastDayOfTheMonth(),
//       }
//     }, this.defaultSelector, selector);
//     options = _.extend({ sort: { date: -1 } }, options);

//     return this.collection.find(selector, options);
//   },
//   monthlyTotal: function total(selector) {
//     return utils.accumulator(this.monthly(selector, { fields: { amount: 1 } }).fetch(), 'amount');
//   },
//   yearly: function yearly(selector, options) {
//     selector = _.extend({
//       date: {
//         $gte: utils.getFirstDayOfTheYear(),
//         $lt: utils.getLastDayOfTheYear(),
//       }
//     }, this.defaultSelector, selector);
//     options = _.extend({ sort: { date: -1 } }, options);

//     return this.collection.find(selector, options);
//   },
//   yearlyTotal: function yearlyTotal(selector) {
//     return utils.accumulator(this.yearly(selector, { fields: { amount: 1 } }).fetch(), 'amount');
//   },
//   all: function all(selector, options) {
//     selector = _.extend({}, this.defaultSelector, selector);
//     options = _.extend({ sort: { date: -1 } }, options);

//     return this.collection.find(selector, options);
//   },
//   total: function total(selector) {
//     return utils.accumulator(this.all(selector, { fields: { amount: 1 } }).fetch(), 'amount');
//   },
//   tagCounts: function tagCounts() {
//     return this.all({}, { fields: { tags: 1 } }).fetch().reduce(function (tagCounts, expense) {
//       expense.tags.forEach(function (tag) {
//         if (!tagCounts.hasOwnProperty(tag)) {
//           tagCounts[tag] = 1;
//         } else {
//           tagCounts[tag] += 1;
//         }
//       });

//       return tagCounts;
//     }, {});
//   },
//   totals: function totals(selector) {
//     return [
//       {
//         name: 'today',
//         title: 'Today',
//         amount: Expenses.dailyTotal(selector)
//       },
//       {
//         name: 'weekly',
//         title: 'This Week',
//         amount: Expenses.weeklyTotal(selector)
//       },
//       {
//         name: 'monthly',
//         title: 'This Month',
//         amount: Expenses.monthlyTotal(selector)
//       },
//       {
//         name: 'yearly',
//         title: 'This Year',
//         amount: Expenses.yearlyTotal(selector)
//       },
//       {
//         name: 'total',
//         title: 'All Time',
//         amount: Expenses.total(selector)
//       },
//     ];
//   },
// };

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

    console.log('selector', selector);

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

// Router.route('/expenses/(.*)', {
//   name: 'filteredExpensesList',
//   controller: ExpensesController
// });
