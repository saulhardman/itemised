Template.layout.helpers({
  isLocked: function () {
    return Session.get('navigation.isOpen') || false;
  }
});
