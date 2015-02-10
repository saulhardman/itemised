Meteor.publish('expenses', function(options) {
  check(options, {
    sort: Object
  });

  return Expenses.find({}, options);
});

Meteor.publish('tags', function() {
  return Tags.find();
});
