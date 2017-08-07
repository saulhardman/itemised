import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { find as findTags } from '/imports/api/tags/methods';

export const Expenses = new Mongo.Collection('expenses');

Expenses.deny({
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

Expenses.schema = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isSet) {
        return this.value;
      } else if (this.isInsert) {
        return new Date();
      }
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isSet) {
        return this.value;
      }

      return new Date();
    },
  },
  archivedAt: {
    type: Date,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isSet) {
        return this.value;
      }
    },
    optional: true,
  },
  isArchived: {
    type: Boolean,
    defaultValue: false,
  },
  amount: {
    type: Number,
    defaultValue: 0,
  },
  note: {
    type: String,
    defaultValue: '',
  },
  date: {
    type: Date,
    autoValue() { // eslint-disable-line consistent-return
      if (this.isSet) {
        return this.value;
      } else if (this.isInsert) {
        return new Date();
      }
    },
  },
  location: {
    type: String,
    defaultValue: '',
  },
  tagIds: {
    type: [String],
    defaultValue: [],
  },
});

Expenses.attachSchema(Expenses.schema);

Expenses.helpers({
  tags() {
    if (this.tagIds.length > 0) {
      return findTags.call({ tagIds: this.tagIds });
    }

    return [];
  },
});
