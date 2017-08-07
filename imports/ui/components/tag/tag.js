import { Template } from 'meteor/templating';

import filteredTagIds from '/imports/ui/filteredTagIds';

import './tag.html';

Template.tag.helpers({
  selected() {
    return filteredTagIds.get().includes(this._id);
  },
});
