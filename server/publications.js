Meteor.publish('expenses', function(options) {
  check(options, {
    sort: Object
  });

  return Expenses.find({}, options);
});

Meteor.publish('expense', function (expenseId) {
  return Expenses.find(expenseId);
});

Meteor.publish('tags', function() {
  return Tags.find();
});
