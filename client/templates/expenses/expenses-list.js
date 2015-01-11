Template.expensesList.rendered = function () {
  this.fastClick = FastClick.attach(this.$('#js-expenses-list')[0]);
};

Template.expensesList.destroyed = function () {
  this.fastClick.destroy();
};

Template.expensesList.helpers({
  isFiltered: function isFiltered() {
    return this.tags.length > 0;
  },
  filteredTags: function filteredTags() {
    return this.tags.map(utils.capitalise).join(', ');
  },
});
