Template.notification.events({
  'click': function (e, template) {
    e.preventDefault();

    switch (template.data.type) {
      case Notifications.TYPES.UNDO:

        if (!Meteor.isCordova) {
          Meteor.call('expenseRestore');
        }

        Meteor.call('notificationRemove', template.data._id);

        break;
    }

    return false;
  },
});
