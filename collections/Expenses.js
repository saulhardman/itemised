Expenses = new Mongo.Collection("expenses");

Expenses.allow({
  insert: function (userId, expense) {
    return expense.createdBy === userId;
  },
  remove: function (userId, expense) {
    return expense.createdBy === userId;
  },
  update: function (userId, expense) {
    return expense.createdBy === userId;
  }
});