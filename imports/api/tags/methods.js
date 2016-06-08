import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Expenses } from '/imports/api/expenses/expenses';
import { Tags } from '/imports/api/tags/tags';
import utils from '/imports/ui/utils';

const tagIdValidate = new SimpleSchema({
  tagId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
}).validator();

export const insert = new ValidatedMethod({
  name: 'tags.insert',
  validate: new SimpleSchema({
    tagName: { type: String },
  }).validator(),
  run({ tagName }) {
    const tagSlug = utils.slug(tagName);
    const tag = Tags.findOne({ name: tagSlug });

    if (tag) {
      return {
        exists: true,
        tagId: tag._id,
      };
    }

    return {
      exists: false,
      tagId: Tags.insert({
        name: tagSlug,
      }),
    };
  },
});

export const increment = new ValidatedMethod({
  name: 'tags.increment',
  validate: tagIdValidate,
  run({ tagId }) {
    return Tags.update(tagId, {
      $inc: {
        count: 1,
      },
    });
  },
});

export const decrement = new ValidatedMethod({
  name: 'tags.decrement',
  validate: tagIdValidate,
  run({ tagId }) {
    return Tags.update(tagId, {
      $inc: {
        count: -1,
      },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'tags.remove',
  validate: tagIdValidate,
  run({ tagId }) {
    return Tags.remove(tagId);
  },
});

export const check = new ValidatedMethod({
  name: 'tags.check',
  validate: tagIdValidate,
  run({ tagId }) {
    const count = Expenses.find({ isArchived: false, tagIds: { $in: [tagId] } }).count();

    if (count > 0) {
      return false;
    }

    return remove.call({ tagId });
  },
});
