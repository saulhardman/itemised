Session.setDefault('navigation.isOpen', false);

Template.navigation.helpers({
  tags: function () {
    return Tags.find({}, { sort: { count: -1 } });
  },
  isOpen: function () {  
    return Session.get('navigation.isOpen');
  },
});

Template.navigation.events({
  'click #js-close-button': function (e) {
    e.preventDefault();
  
    Session.set('navigation.isOpen', false);

    return false;
  },
});
