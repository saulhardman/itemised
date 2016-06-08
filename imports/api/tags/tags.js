import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import utils from '/imports/ui/utils';

class TagsCollection extends Mongo.Collection {}

export const Tags = new TagsCollection('tags', {
  transform(doc) {
    doc.prettyName = utils.prettyName(doc.name);

    return doc;
  },
});

Tags.deny({
  insert() {
    return true;
  },
  remove() {
    return true;
  },
  update() {
    return true;
  },
});

Tags.schema = new SimpleSchema({
  name: {
    type: String,
  },
  count: {
    type: Number,
    defaultValue: 1,
  },
});

Tags.attachSchema(Tags.schema);
