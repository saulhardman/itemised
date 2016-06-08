import $ from 'jquery';
import attachFastClick from 'fastclick';
import { Meteor } from 'meteor/meteor';

// Fastclick
Meteor.startup(() => {
  attachFastClick(document.body);

  if (Meteor.isCordova) {
    $(document.documentElement).addClass('is-cordova');
  }
});

// Helpers
import './helpers';

// Routes
import './routes';
