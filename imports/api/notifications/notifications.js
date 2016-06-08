import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import values from 'lodash.values';

class NotificationsCollection extends Mongo.Collection {}

export const Notifications = new NotificationsCollection(null);

export const types = {
  info: 1,
  undo: 2,
};

Notifications.schema = new SimpleSchema({
  message: {
    type: String,
  },
  type: {
    type: Number,
    optional: true,
    defaultValue: types.info,
    allowedValues: values(types),
  },
  duration: {
    type: Number,
    optional: true,
    defaultValue: 3000,
  },
  showOnlyOne: {
    type: Boolean,
    optional: true,
    defaultValue: true,
  },
});

Notifications.attachSchema(Notifications.schema);
