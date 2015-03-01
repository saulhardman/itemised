Template.expenseArchive.helpers({
  count: function () {
    var filteredTagIds;

    if ((filteredTagIds = Session.get('filteredTagIds') || []).length > 0) {
      return Expenses.find({ isDeleted: true, tagIds: { $in: filteredTagIds } }).count();
    }

    return Expenses.find({ isDeleted: true }).count();
  },
});

Template.expenseArchive.rendered = function () {
  this.find('#js-expenses')._uihooks = expensesUiHooks;
};
