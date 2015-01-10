Tags = new Mongo.Collection('tags');

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

      Tags.update(tag._id, {
        $inc: {
          count: 1
        }
      });

      return tag._id;
    }

    return Tags.insert({
      name: tagName,
      count: 1,
    });
  },
});
