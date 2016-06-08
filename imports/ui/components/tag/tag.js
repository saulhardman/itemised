import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './tag.html';

Template.tag.helpers({
  selected() {
    const filteredTagIds = Session.get('filteredTagIds') || [];

    if (filteredTagIds.length > 0) {
      return (filteredTagIds.indexOf(this._id) !== -1);
    }

    return false;
  },
});
