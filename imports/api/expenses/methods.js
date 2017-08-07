import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import filteredTagIds from '/imports/ui/filteredTagIds';
import { Expenses } from '/imports/api/expenses/expenses';
import { types } from '/imports/api/notifications/notifications';
import { insert as notificationInsert } from '/imports/api/notifications/methods';
import {
  find as findTags,
  insert as insertTag,
  check as checkTag,
} from '/imports/api/tags/methods';

const ID_SCHEMA = {
  type: String,
  regEx: SimpleSchema.RegEx.Id,
};

const ID_VALIDATOR = new SimpleSchema({
  expenseId: ID_SCHEMA,
}).validator();

const TAG_NAMES_SCHEMA = {
  type: [String],
  defaultValue: [],
};

const TAG_NAME_SCHEMA = { type: String };

const TAG_IDS_VALIDATOR = new SimpleSchema({
  tagIds: { type: [String] },
  'tagIds.$': ID_SCHEMA,
}).validator();

export const findOne = new ValidatedMethod({
  name: 'expense.findOne',
  validate: ID_VALIDATOR,
  run({ expenseId }) {
    return Expenses.findOne(expenseId);
  },
});

export const find = new ValidatedMethod({
  name: 'expense.find',
  validate: TAG_IDS_VALIDATOR,
  run({ tagIds }) {
    const selector = { isArchived: false };
    const options = { sort: { date: -1 } };

    if (tagIds.length > 0) {
      selector.tagIds = { $in: tagIds };
    }

    return Expenses.find(selector, options);
  },
});

export const findArchived = new ValidatedMethod({
  name: 'expense.findArchived',
  validate: TAG_IDS_VALIDATOR,
  run({ tagIds }) {
    const selector = { isArchived: true };
    const options = { sort: { archivedAt: -1 } };

    if (tagIds.length > 0) {
      selector.tagIds = { $in: tagIds };
    }

    return Expenses.find(selector, options);
  },
});

export const insert = new ValidatedMethod({
  name: 'expense.insert',
  validate: new SimpleSchema({
    amount: Expenses.simpleSchema().schema('amount'),
    note: Expenses.simpleSchema().schema('note'),
    date: Expenses.simpleSchema().schema('date'),
    location: Expenses.simpleSchema().schema('location'),
    tagNames: TAG_NAMES_SCHEMA,
    'tagNames.$': TAG_NAME_SCHEMA,
  }).validator(),
  run({ amount, note, date, location, tagNames }) {
    const tagIds = tagNames.map((tagName) => insertTag.call({ tagName }).tagId);

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
  name: 'expense.update',
  validate: new SimpleSchema({
    expenseId: ID_SCHEMA,
    amount: Expenses.simpleSchema().schema('amount'),
    note: Expenses.simpleSchema().schema('note'),
    location: Expenses.simpleSchema().schema('location'),
    date: Expenses.simpleSchema().schema('date'),
    tagNames: TAG_NAMES_SCHEMA,
    'tagNames.$': TAG_NAME_SCHEMA,
  }).validator(),
  run({ expenseId, note, amount, date, location, tagNames }) {
    const tagIds = tagNames.map((tagName) => insertTag.call({ tagName }).tagId);

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
  name: 'expense.archive',
  validate: ID_VALIDATOR,
  run({ expenseId }) {
    const now = new Date();

    if (Meteor.isClient) {
      let message;

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

      const tags = findTags.call({ tagIds: filteredTagIds.get() }).fetch();
      const count = tags.reduce((accumulator, tag) => accumulator + tag.count, 0);

      if (count === 0) {
        filteredTagIds.set([]);
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
  name: 'expense.restore',
  validate: new SimpleSchema({
    expenseId: Object.assign({}, ID_SCHEMA, {
      autoValue() {
        if (this.isSet) {
          return this.value;
        }

        return Expenses.findOne({}, { sort: { archivedAt: -1 } })._id;
      },
    }),
  }).validator({ clean: true }),
  run({ expenseId }) {
    return Expenses.update(expenseId, {
      $set: {
        isArchived: false,
        updatedAt: new Date(),
      },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'expense.remove',
  validate: ID_VALIDATOR,
  run({ expenseId }) {
    findOne.call({ expenseId }).forEach((tag) => checkTag.call({ tagId: tag._id }));

    return Expenses.remove(expenseId);
  },
});
