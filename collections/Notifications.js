Notifications = new Mongo.Collection(null);

Notifications.TYPES = {
  INFO: 1,
  UNDO: 2,
};

Notifications.defaults = {
  type: Notifications.TYPES.INFO,
  duration: 5000,
  showOnlyOne: true,
};

Meteor.methods({
  notificationInsert: function (notification) {
    var notificationId;
    var notifications;

    _.defaults(notification, Notifications.defaults);

    if (notification.showOnlyOne) {
      notifications = Notifications.find({ type: notification.type });

      if (notifications.count() > 0) {
        notifications.forEach(function (notification) {
          Meteor.call('notificationRemove', notification);
        }, this);
      }
    }

    notificationId = Notifications.insert(notification);

    if (typeof notification.duration === 'number') {
      setTimeout(Meteor.call.bind(Meteor, 'notificationRemove', notificationId), notification.duration);
    }

    return notificationId;
  },
  notificationRemove: function (notification) {
    return Notifications.remove(notification);
  },
});
