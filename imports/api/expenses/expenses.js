import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Tags } from '/imports/api/tags/tags';

class ExpensesCollection extends Mongo.Collection {}

export const Expenses = new ExpensesCollection('expenses', {
  transform(doc) {
    if (Array.isArray(doc.tagIds)) {
      doc.tags = Tags.find({ _id: { $in: doc.tagIds } });
    }

    return doc;
  },
});

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

// Expenses.helpers({
//   tags() {
//     return Tags.findOne(this.listId);
//   },
// });
