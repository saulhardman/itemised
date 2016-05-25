Template.layout.helpers({
  isLocked() {
    return Session.get('navigation.isOpen') || false;
  },
});
