import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import values from 'lodash.values';

import { Notifications, types } from '/imports/api/notifications/notifications';

export const remove = new ValidatedMethod({
  name: 'notifications.remove',
  validate: new SimpleSchema({
    notificationId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
    type: {
      type: Number,
      allowedValues: values(types),
      optional: true,
    },
  }).validator(),
  run({ notificationId, type }) {
    if (notificationId) {
      return Notifications.remove(notificationId);
    }

    return Notifications.remove({ type });
  },
});

export const insert = new ValidatedMethod({
  name: 'notifications.insert',
  validate: Notifications.schema.validator({ clean: true }),
  run({ message, type, duration, showOnlyOne }) {
    if (showOnlyOne) {
      const notifications = Notifications.find({ type });

      if (notifications.count() > 0) {
        notifications.forEach((n) => remove.call({ notificationId: n._id }));
      }
    }

    const notificationId = Notifications.insert({
      message,
      type,
      duration,
      showOnlyOne,
    });

    setTimeout(() => remove.call({ notificationId }), duration);

    return notificationId;
  },
});
