Meteor.startup(function () {
  var expense;
  var count = Expenses.find().count();
  var i;

  if (count < 10) {
    expense = {
      note: 'This is an example of a note',
      amount: '100',
      date: Date.now(),
      createdBy: '4kRGPMn3vGByF6Rmh',
      tags: ['food', 'essentials', 'drinks', 'leisure', 'activity'],
    };

    for (i = 0; i < 10 - count; i++) {
      Expenses.insert(expense);
    }
  }

});
