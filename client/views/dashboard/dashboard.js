Template.dashboard.rendered = function () {
  this.fastClick = FastClick.attach(this.$('#js-dashboard')[0]);
};

Template.dashboard.destroyed = function () {
  this.fastClick.destroy();
};
