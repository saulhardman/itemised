import { Meteor } from 'meteor/meteor';

import { Tags } from '/imports/api/tags/tags';

Meteor.publish('tags', () => Tags.find());
