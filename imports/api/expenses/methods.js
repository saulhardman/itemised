import difference from 'lodash.difference';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Expenses } from '/imports/api/expenses/expenses';
import { types } from '/imports/api/notifications/notifications';
import { insert as notificationInsert } from '/imports/api/notifications/methods';
import { Tags } from '/imports/api/tags/tags';
import {
  check as tagCheck,
  decrement as tagDecrement,
  increment as tagIncrement,
  insert as tagInsert,
} from '/imports/api/tags/methods';

export const findOne = new ValidatedMethod({
  name: 'expenses.findOne',
  validate: new SimpleSchema({
    expenseId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ expenseId }) {
    return Expenses.findOne(expenseId);
  },
});

export const insert = new ValidatedMethod({
  name: 'expenses.insert',
  validate: new SimpleSchema({
    amount: { type: Number },
    note: { type: String },
    date: { type: Date },
    location: { type: String },
    tagNames: { type: [String] },
  }).validator(),
  run({ amount, note, date, location, tagNames }) {
    let tagIds = [];

    if (Array.isArray(tagNames)) {
      tagIds = tagNames.map((tagName) => {
        const result = tagInsert.call({ tagName });

        if (result.exists) {
          tagIncrement.call({ tagId: result.tagId });
        }

        return result.tagId;
      });
    }

    return Expenses.insert({
      amount,
      note,
      date,
      location,
      tagIds,
    });
  },
});

export const update = new ValidatedMethod({
  name: 'expenses.update',
  validate: new SimpleSchema({
    expenseId: { type: String },
    amount: { type: Number },
    note: { type: String },
    location: { type: String },
    date: { type: Date },
    tagNames: { type: [String] },
  }).validator(),
  run({ expenseId, note, amount, date, location, tagNames }) {
    const expense = Expenses.findOne(expenseId);
    let tagIds = [];

    if (Array.isArray(tagNames)) {
      tagIds = tagNames.map((tagName) => {
        const result = tagInsert.call({ tagName });

        if (result.exists) {
          tagIncrement.call({ tagId: result.tagId });
        }

        return result.tagId;
      });
    }

    difference(expense.tagIds, tagIds).forEach((tagId) => tagDecrement.call({ tagId }));

    return Expenses.update(expenseId, {
      $set: {
        updatedAt: new Date(),
        amount,
        note,
        date,
        location,
        tagIds,
      },
    });
  },
});

export const archive = new ValidatedMethod({
  name: 'expenses.archive',
  validate: new SimpleSchema({
    expenseId: { type: String },
  }).validator(),
  run({ expenseId }) {
    const expense = Expenses.findOne(expenseId);
    const now = new Date();
    let message;

    expense.tagIds.forEach((tagId) => tagDecrement.call({ tagId }));

    if (Meteor.isClient) {
      // TODO: replace this with mobile breakpoint condition
      if (Meteor.isCordova) {
        message = 'Shake your device or tap here to undo';
      } else {
        message = 'Click here to undo';
      }

      notificationInsert.call({
        message,
        type: types.undo,
      });

      const filteredTagIds = Session.get('filteredTagIds') || [];
      const tags = Tags.find({ _id: { $in: filteredTagIds } }).fetch();
      const count = tags.reduce((accumulator, tag) => accumulator + tag.count, 0);

      if (count === 0) {
        Session.set('filteredTagIds', []);
      }
    }

    return Expenses.update(expenseId, {
      $set: {
        isArchived: true,
        archivedAt: now,
        updatedAt: now,
      },
    });
  },
});

export const restore = new ValidatedMethod({
  name: 'expenses.restore',
  validate: new SimpleSchema({
    expenseId: { type: String, optional: true },
  }).validator(),
  run({ expenseId }) {
    let expense;

    if (typeof expenseId === 'undefined') {
      expense = Expenses.findOne({}, { sort: { archivedAt: -1 } });
    } else {
      expense = Expenses.findOne(expenseId);
    }

    expense.tagIds.forEach((tagId) => {
      tagIncrement.call({ tagId });
    });

    return Expenses.update(expense._id, {
      $set: {
        isArchived: false,
        updatedAt: new Date(),
      },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'expenses.remove',
  validate: new SimpleSchema({
    expenseId: { type: String },
  }).validator(),
  run({ expenseId }) {
    const expense = Expenses.findOne(expenseId);

    expense.tagIds.forEach((tagId) => tagCheck.call({ tagId }));

    return Expenses.remove(expenseId);
  },
});
