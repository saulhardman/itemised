Expenses = new Mongo.Collection('expenses');

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
  expenseInsert: function tagInsert(expenseAttributes) {
    var tagNames = expenseAttributes.tagNames;
    var tagIds = [];

    if (Array.isArray(tagNames) && tagNames.length > 0) {
      tagIds = tagNames.map(function (tagName) {
        return Meteor.call('tagInsert', tagName);
      });
    }

    _.extend(expenseAttributes, {
      tagIds: tagIds,
      userId: Meteor.userId(),
      isDeleted: false,
    });

    return Expenses.insert(expenseAttributes);
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
