Template.expenseIndex.rendered = function () {
  this.fastClick = FastClick.attach(this.$('#js-expense-index')[0]);
};

Template.expenseIndex.destroyed = function () {
  this.fastClick.destroy();
};

Template.expenseIndex.helpers({
  isFiltered: function isFiltered() {
    return this.tags.length > 0;
  },
  filteredTags: function filteredTags() {
    return this.tags.map(utils.capitalise).join(', ');
  },
});
