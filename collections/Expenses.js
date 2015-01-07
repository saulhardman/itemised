Expenses = {
  collection: new Mongo.Collection('expenses'),
  daily: function daily(selector, options) {
    selector = _.extend({ date: { $gte: utils.getToday() } }, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  dailyTotal: function total(selector) {
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
  weeklyTotal: function total(selector) {
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
  all: function all(selector, options) {
    selector = _.extend({}, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  total: function total(selector) {
    return utils.accumulator(this.all(selector, { fields: { amount: 1 } }).fetch(), 'amount');
  },
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
