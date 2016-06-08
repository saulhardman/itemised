import $ from 'jquery';
import { Template } from 'meteor/templating';
import { Notifications } from '/imports/api/notifications/notifications';
import velocity from 'velocity-animate';

import './notifications.html';

Template.notifications.helpers({
  notifications() {
    return Notifications.find();
  },
});

const notificationUiHooks = {
  insertElement(node, next) {
    const $node = $(node).css('visibility', 'hidden');

    $node.insertBefore(next);

    const height = $node.height();

    $node.css('visibility', 'visible').height(0);

    velocity($node, { height }).then(() => $node.height('auto'));
  },
  removeElement(node) {
    const $node = $(node);

    velocity($node, { height: 0 }).then(() => $node.remove());
  },
};

Template.notifications.onRendered(function onRendered() {
  this.find('#js-notifications')._uihooks = notificationUiHooks;
});
