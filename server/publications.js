Meteor.publish('expenses', function(options) {
  check(options, {
    sort: Object
  });

  return Expenses.find({}, options);
});

// Meteor.publish('totals', function () {
//   return Expenses.find({}, { field: { amount: 1 } });
// });

Meteor.publish('tags', function(expenseId) {
  return Tags.find({});
});
