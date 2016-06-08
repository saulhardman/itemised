import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import './header.html';

Template.header.events({
  'click #js-back-button'(event) {
    event.preventDefault();

    if (window.history.length > 0) {
      window.history.back();
    } else {
      Router.go('/');
    }

    return false;
  },
});
