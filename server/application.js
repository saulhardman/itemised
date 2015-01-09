Meteor.startup(function () {
  var expense;
  var count = Expenses.all().count();
  var minimum = 5;
  var i;

  if (count < minimum) {
    for (i = 0; i < minimum - count; i++) {
      Expenses.collection.insert({
        note: _.sample(['Cheese', 'Sushi', 'Sandwich', 'iPhone Case', 'Inner Tube']),
        amount: Math.round(Math.random() * 1000),
        location: _.sample(['Tesco', 'Pret a Manger', 'Stokey Bear\'s', 'Waitrose', 'Yo! Sushi', '']),
        date: new Date(2015, 0, Math.ceil(Math.random() * new Date().getDate()), Math.round(Math.random() * 24)),
        createdBy: '4kRGPMn3vGByF6Rmh',
        tags: _.sample(['food', 'essentials', 'drinks', 'leisure', 'activity'], Math.ceil(Math.random() * 5)),
        isDeleted: false,
      });
    }
  }

});
