Template.expensesList.rendered = function () {
  this.fastClick = FastClick.attach(this.$('#js-expenses-list')[0]);
};

Template.expensesList.destroyed = function () {
  this.fastClick.destroy();
};
