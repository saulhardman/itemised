Expenses = {
  collection: new Mongo.Collection('expenses'),
  daily: function daily(selector, options) {
    selector = _.extend({ date: { $gte: utils.getToday() } }, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  dailyTotal: function dailyTotal(selector) {
    return utils.accumulator(this.daily(selector, { fields: { amount: 1 } }).fetch(), 'amount');
  },
  weekly: function weekly(selector, options) {
    selector = _.extend({
      date: {
        $gte: utils.getFirstDayOfTheWeek(),
        $lt: utils.getLastDayOfTheWeek(),
      }
    }, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  weeklyTotal: function weeklyTotal(selector) {
    return utils.accumulator(this.weekly(selector, { fields: { amount: 1 } }).fetch(), 'amount');
  },
  monthly: function monthly(selector, options) {
    selector = _.extend({
      date: {
        $gte: utils.getFirstDayOfTheMonth(),
        $lt: utils.getLastDayOfTheMonth(),
      }
    }, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  monthlyTotal: function total(selector) {
    return utils.accumulator(this.monthly(selector, { fields: { amount: 1 } }).fetch(), 'amount');
  },
  yearly: function yearly(selector, options) {
    selector = _.extend({
      date: {
        $gte: utils.getFirstDayOfTheYear(),
        $lt: utils.getLastDayOfTheYear(),
      }
    }, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  yearlyTotal: function yearlyTotal(selector) {
    return utils.accumulator(this.yearly(selector, { fields: { amount: 1 } }).fetch(), 'amount');
  },
  all: function all(selector, options) {
    selector = _.extend({}, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  total: function total(selector) {
    return utils.accumulator(this.all(selector, { fields: { amount: 1 } }).fetch(), 'amount');
  },
  tagCounts: function tagCounts() {
    return this.all({}, { fields: { tags: 1 } }).fetch().reduce(function (tagCounts, expense) {
      expense.tags.forEach(function (tag) {
        if (!tagCounts.hasOwnProperty(tag)) {
          tagCounts[tag] = 1;
        } else {
          tagCounts[tag] += 1;
        }
      });

      return tagCounts;
    }, {});
  },
  totals: function totals(selector) {
    return [
      {
        name: 'today',
        title: 'Today',
        amount: Expenses.dailyTotal(selector)
      },
      {
        name: 'weekly',
        title: 'This Week',
        amount: Expenses.weeklyTotal(selector)
      },
      {
        name: 'monthly',
        title: 'This Month',
        amount: Expenses.monthlyTotal(selector)
      },
      {
        name: 'yearly',
        title: 'This Year',
        amount: Expenses.yearlyTotal(selector)
      },
      {
        name: 'total',
        title: 'All Time',
        amount: Expenses.total(selector)
      },
    ];
  },
};

Expenses.collection.allow({
  insert: function (userId, expense) {
    // return expense.createdBy === userId;
    return true;
  },
  remove: function (userId, expense) {
    // return expense.createdBy === userId;
    return true;
  },
  update: function (userId, expense) {
    // return expense.createdBy === userId;
    return true;
  }
});
