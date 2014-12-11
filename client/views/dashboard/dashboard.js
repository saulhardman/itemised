Template.dashboard.helpers({
  expenses: function () {
    return Expenses.find();
  },
  isEmpty: function () {
    return Expenses.find().count() === 0;
  }
});
