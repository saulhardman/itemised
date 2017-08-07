import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import utils from '/imports/ui/utils';

import { Expenses } from '/imports/api/expenses/expenses';

export const Tags = new Mongo.Collection('tags');

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
});

Tags.attachSchema(Tags.schema);

Tags.helpers({
  prettyName() {
    return utils.prettyName(this.name);
  },
  count() {
    return Expenses.find({ isArchived: false, tagIds: { $in: [this._id] } }).count();
  },
  archivedCount() {
    return Expenses.find({ isArchived: true, tagIds: { $in: [this._id] } }).count();
  },
  totalCount() {
    return Expenses.find({ tagIds: { $in: [this._id] } }).count();
  },
});
