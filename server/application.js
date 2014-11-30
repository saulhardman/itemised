Meteor.startup(function () {
  var expense;
  var i;

  if (Expenses.find().count() === 0) {
    expense = {
      note: 'This is an example of a note',
      amount: '100',
      createdBy: '4kRGPMn3vGByF6Rmh'
    };

    for (i = 0; i < 10; i++) {
      Expenses.insert(expense);
    }      
  }

});
