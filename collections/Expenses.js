Expenses = new Mongo.Collection('expenses', {
  transform: function transform(doc) {
    if (Array.isArray(doc.tagIds)) {
      doc.tags = Tags.find({ _id: { $in: doc.tagIds } });
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
  expenseInsert: function (expenseAttributes) {
    var tagNames = expenseAttributes.tagNames;
    var tagIds = [];
    var now = new Date();

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
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      amount: expenseAttributes.amount,
      note: expenseAttributes.note,
      date: expenseAttributes.date,
      location: expenseAttributes.location,
      tagIds: tagIds,
    });
  },
  expenseUpdate: function (expenseId, updatedAttributes) {
    var expense = Expenses.findOne(expenseId);
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

    return Expenses.update(expenseId, {
      $set: {
        amount: updatedAttributes.amount,
        note: updatedAttributes.note,
        date: updatedAttributes.date,
        location: updatedAttributes.location,
        tagIds: tagIds,
        updatedAt: new Date(),
      }
    });
  },
  expenseDelete: function (expenseId) {
    var expense = Expenses.findOne(expenseId);
    var now = new Date();
    var message;

    Expenses.update(expenseId, {
      $set: {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      }
    });

    expense.tagIds.forEach(function (tagId) {
      Tags.update(tagId, {
        $inc: {
          count: -1
        }
      });
    });

    if (Meteor.isClient) {

      if (Meteor.isCordova) {
        message = 'Shake your device to undo';
      } if (Modernizr.devicemotion && Modernizr.touch) {
        message = 'Shake your device or tap here to undo';
      } else {
        message = 'Click here to undo';
      }

      Meteor.call('notificationInsert', {
        message: message,
        type: Notifications.TYPES.UNDO,
      });

    }

    return expenseId;
  },
  expenseRestore: function (expenseId) {
    var expense;

    if (typeof expenseId === 'undefined') {
      expense = Expenses.findOne({}, { sort: { deletedAt: -1 } });

      expenseId = expense._id;
    } else {
      expense = Expenses.findOne(expenseId);
    }

    Expenses.update(expenseId, {
      $set: {
        isDeleted: false,
        updatedAt: new Date(),
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
  expenseDestroy: function (expenseId) {
    var expense = Expenses.findOne(expenseId);

    Expenses.remove(expenseId);

    expense.tagIds.forEach(function (tagId) {
      Tags.update(tagId, {
        $inc: {
          count: -1
        }
      });
    });

    return expenseId;
  },
});
