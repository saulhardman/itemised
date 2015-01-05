Expenses = {
  collection: new Mongo.Collection('expenses'),
  daily: function daily(selector, options) {
    selector = _.extend({ date: { $gte: utils.getToday() } }, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  dailyTotal: function total() {
    return utils.accumulator(this.daily().fetch(), 'amount');
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
  weeklyTotal: function total() {
    return utils.accumulator(this.weekly().fetch(), 'amount');
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
  monthlyTotal: function total() {
    return utils.accumulator(this.monthly().fetch(), 'amount');
  },
  all: function all(selector, options) {
    selector = _.extend({}, selector);
    options = _.extend({ sort: { date: -1 } }, options);

    return this.collection.find(selector, options);
  },
  total: function total() {
    return utils.accumulator(this.all().fetch(), 'amount');
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
