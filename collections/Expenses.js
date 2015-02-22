Expenses = new Mongo.Collection('expenses', {
  transform: function transform(doc) {
    var filteredTagIds;

    doc.tags = Tags.find({ _id: { $in: doc.tagIds || [] } });

    if (Meteor.isClient && (filteredTagIds = Session.get('filteredTagIds') || []).length) {
      doc.tags.forEach(function (tag) {
        if (filteredTagIds.indexOf(tag._id)) {
          tag.selected = true;
        }
      });
    }

    return doc;
  }
});

Expenses.allow({
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
  expenseInsert: function expenseInsert(expenseAttributes) {
    var tagNames = expenseAttributes.tagNames;
    var tagIds = [];

    if (Array.isArray(tagNames) && tagNames.length > 0) {
      tagIds = tagNames.map(function (tagName) {
        var result = Meteor.call('tagInsert', tagName);

        if (result.exists) {
          Meteor.call('tagIncrement', result.tagId);
        }

        return result.tagId;
      });
    }

    return Expenses.insert({
      userId: Meteor.userId(),
      isDeleted: false,
      amount: expenseAttributes.amount,
      note: expenseAttributes.note,
      date: expenseAttributes.date,
      location: expenseAttributes.location,
      tagIds: tagIds,
    });
  },
  expenseUpdate: function expenseUpdate(expense, updatedAttributes) {
    var tagNames = updatedAttributes.tagNames;
    var tagIds = [];

    if (Array.isArray(tagNames) && tagNames.length > 0) {
      tagIds = tagNames.map(function (tagName) {
        return Meteor.call('tagInsert', tagName).tagId;
      });
    }

    _.difference(expense.tagIds, tagIds).forEach(function (tagId) {
      Meteor.call('tagDecrement', tagId);
    });

    Meteor.call('tagClean');

    return Expenses.update(expense._id, {
      $set: {
        amount: updatedAttributes.amount,
        note: updatedAttributes.note,
        date: updatedAttributes.date,
        location: updatedAttributes.location,
        tagIds: tagIds,
      }
    });
  },
  expenseDelete: function expenseDelete(expenseId) {
    var expense = Expenses.findOne(expenseId);

    Expenses.update(expenseId, {
      $set: {
        isDeleted: true,
      }
    });

    expense.tagIds.forEach(function (tagId) {
      Tags.update(tagId, {
        $inc: {
          count: -1
        }
      });
    });

    Meteor.call('tagClean');

    return expenseId;
  },
  expenseRestore: function expenseRestore(expenseId) {
    var expense = Expenses.findOne(expenseId);

    Expenses.update(expenseId, {
      $set: {
        isDeleted: false,
      }
    });

    expense.tagIds.forEach(function (tagId) {
      Tags.update(tagId, {
        $inc: {
          count: 1
        }
      });
    });

    return expenseId;
  },
});
