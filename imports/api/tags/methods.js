import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Tags } from '/imports/api/tags/tags';
import utils from '/imports/ui/utils';

const TAG_ID_SCHEMA = {
  type: String,
  regEx: SimpleSchema.RegEx.Id,
};

const TAG_ID_VALIDATOR = new SimpleSchema({ tagId: TAG_ID_SCHEMA }).validator();

export const findOne = new ValidatedMethod({
  name: 'tag.findOne',
  validate: TAG_ID_VALIDATOR,
  run({ tagId }) {
    return Tags.findOne(tagId);
  },
});

export const find = new ValidatedMethod({
  name: 'tag.find',
  validate: new SimpleSchema({
    tagIds: {
      type: [String],
      optional: true,
    },
  }).validator(),
  run({ tagIds }) {
    const options = { sort: { count: -1 } };

    if (tagIds && tagIds.length > 0) {
      return Tags.find({ _id: { $in: tagIds } }, options);
    }

    return Tags.find({}, options);
  },
});

export const insert = new ValidatedMethod({
  name: 'tag.insert',
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
      tagId: Tags.insert({ name: tagSlug }),
    };
  },
});

export const remove = new ValidatedMethod({
  name: 'tag.remove',
  validate: TAG_ID_VALIDATOR,
  run({ tagId }) {
    return Tags.remove(tagId);
  },
});

export const check = new ValidatedMethod({
  name: 'tag.check',
  validate: TAG_ID_VALIDATOR,
  run({ tagId }) {
    const tag = findOne(tagId);

    if (tag.totalCount() > 0) {
      return true;
    }

    return remove.call({ tagId });
  },
});
