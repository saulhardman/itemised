Meteor.startup(() => {
  var $body = $('body').addClass('body');

  if (Session.get('navigation.isOpen') === true) {
    $body.addClass('body--is-locked');
  }

  Tracker.autorun(() => {
    if (Session.get('navigation.isOpen') === true) {
      $body.addClass('body--is-locked');
    } else {
      $body.removeClass('body--is-locked');
    }
  });
});
