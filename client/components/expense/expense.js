Template.expense.events({
  'click .js-expense': function (e) {
    var $this = $(e.currentTarget);

    $this.find('.js-delete-expense').toggle();
  },
  'click .js-delete-expense': function () {
    Expenses.remove(this._id);
  },
});
