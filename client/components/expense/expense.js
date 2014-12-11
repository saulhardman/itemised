Template.expense.helpers({
  hasTags: function () {
    return this.tags.length !== 0;
  }
});

Template.expense.events({
  'click .js-expense, toggle .js-expense': function (event, template) {
    var $this = $(event.currentTarget);

    $this
      .toggleClass('expense--is-expanded')
      .toggleClass('js-expense--is-expanded')
      .find('.expense__content')
        .toggleClass('expense--is-expanded__content')
        .end()
      .find('.expense__delete-button')
        .toggleClass('expense--is-expanded__delete-button');

    if (event.type === 'click') {
      $('.js-expense--is-expanded').not($this).trigger('toggle');
    }
  },
  'click .js-delete-expense': function () {
    Expenses.remove(this._id);
  }
});
