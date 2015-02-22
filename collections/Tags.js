Tags = new Mongo.Collection('tags', {
  transform: function transform(doc) {
    doc.prettyName = utils.prettyName(doc.name);
  
    return doc;
  },
});

Tags.allow({
  insert: function () {
    return true;
  },
  remove: function () {
    return true;
  },
  update: function () {
    return true;
  }
});

Meteor.methods({
  tagInsert: function tagInsert(tagName) {
    var tag;

    if ((tag = Tags.findOne({ name: tagName }))) {
      return {
        exists: true,
        tagId: tag._id,
      };
    }

    return {
      exists: false,
      tagId: Tags.insert({
        name: tagName,
        count: 1,
      })
    };
  },
  tagIncrement: function tagIncrement(tagId) {
    return Tags.update(tagId, {
      $inc: {
        count: 1
      }
    });
  },
  tagDecrement: function tagDecrement(tagId) {
    return Tags.update(tagId, {
      $inc: {
        count: -1
      }
    });
  },
});
