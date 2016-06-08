import { Template } from 'meteor/templating';

import { restore } from '/imports/api/expenses/methods';
import { types } from '/imports/api/notifications/notifications';
import { remove } from '/imports/api/notifications/methods';

import './notification.html';

Template.notification.events({
  click(event, instance) {
    event.preventDefault();

    if (instance.data.type === types.undo) {
      remove.call({ notificationId: instance.data._id });

      restore.call({});
    }

    return false;
  },
});
