Meteor.publish('expenses', () => Expenses.find());

Meteor.publish('tags', () => Tags.find());
