Session.setDefault('navigation.isOpening', false);
Session.setDefault('navigation.isOpen', false);

Template.navigation.helpers({
  tags() {
    return Tags.find({}, { sort: { count: -1 } });
  },
  isOpening() {
    return Session.get('navigation.isOpening');
  },
});

Template.navigation.events({
  'transitionend #js-navigation': function (e) {
    if (Session.get('navigation.isOpening')) {
      Session.set('navigation.isOpen', true);
    }
  },
  'click #js-close-button': function (e) {
    e.preventDefault();

    Session.set('navigation.isOpening', false);
    Session.set('navigation.isOpen', false);

    return false;
  },
});

Template.navigation.onRendered(function () {
  this.fastClick = FastClick.attach(this.firstNode);
});

Template.navigation.onDestroyed(function () {
  this.fastClick.destroy();

  this.fastClick = null;
});
