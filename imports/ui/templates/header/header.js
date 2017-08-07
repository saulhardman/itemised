import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './header.html';

Template.header.events({
  'click #js-back-button'(event) {
    event.preventDefault();

    if (window.history.length > 0) {
      window.history.back();
    } else {
      FlowRouter.go('/');
    }

    return false;
  },
});
