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
  
    Session.set('navigation.isOpen', true);

    return false;
  },
});

Template.header.rendered = function () {
  this.fastClick = FastClick.attach(this.firstNode.parentNode);
};

Template.header.destroyed = function () {
  this.fastClick.detach();

  delete this.fastClick;
};
