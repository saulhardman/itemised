Meteor.startup(function () {
  var expense;
  var count = Expenses.all().count();
  var minimum = 5;
  var i;

  if (count < minimum) {
    expense = {
      note: 'This is an example of a note',
      amount: '100',
      date: new Date(),
      createdBy: '4kRGPMn3vGByF6Rmh',
      tags: ['food', 'essentials', 'drinks', 'leisure', 'activity'],
    };

    for (i = 0; i < minimum - count; i++) {
      Expenses.collection.insert(expense);
    }
  }

});
