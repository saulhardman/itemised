Meteor.publish('expenses', function() {
  return Expenses.find();
});

Meteor.publish('tags', function() {
  return Tags.find();
});
