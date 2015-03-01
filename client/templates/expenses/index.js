Template.expenseIndex.helpers({
  count: function () {
    var filteredTagIds;

    if ((filteredTagIds = Session.get('filteredTagIds') || []).length > 0) {
      return Expenses.find({ isDeleted: false, tagIds: { $in: filteredTagIds } }).count();
    }

    return Expenses.find({ isDeleted: false }).count();
  },
});

Template.expenseIndex.rendered = function () {
  this.find('#js-expenses')._uihooks = expensesUiHooks;
};
