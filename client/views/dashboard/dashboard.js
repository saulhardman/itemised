Template.dashboard.rendered = function () {
  this.fastClick = FastClick.attach(this.find('#js-dashboard')[0]);
};

Template.dashboard.destroyed = function () {
  this.fastClick.destroy();
};
