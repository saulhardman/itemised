Template.header.events({
  'click #js-back-button': function (e) {
    e.preventDefault();

    if (window.history.length > 0) {
      window.history.back();
    } else {
      Router.go('/');
    }

    return false;
  },
  'click #js-menu-button': function (e) {
    e.preventDefault();

    Session.set('navigation.isOpening', true);

    return false;
  },
});

Template.header.onRendered(function () {
  this.fastClick = FastClick.attach(this.firstNode);
});

Template.header.onDestroyed(function () {
  this.fastClick.destroy();

  this.fastClick = null;
});
