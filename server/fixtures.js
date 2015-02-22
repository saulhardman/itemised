var expense;
var count = Expenses.find({ isDeleted: false }).count();
var minimum = 20;
var i;

if (count < minimum) {
  for (i = 0; i < minimum - count; i++) {
    Meteor.call('expenseInsert', {
      note: _.sample(['Cheese', 'Sushi', 'Sandwich', 'iPhone Case', 'Inner Tube']),
      amount: Math.round(Math.random() * 1000),
      location: _.sample(['Tesco', 'Pret a Manger', 'Stokey Bear\'s', 'Waitrose', 'Yo! Sushi', '']),
      date: moment().subtract(Math.round(Math.random() * 365), 'days').hour(_.sample(_.keys(utils.getTimes()))).toDate(),
      userId: '4kRGPMn3vGByF6Rmh',
      tagNames: _.sample(['food', 'essentials', 'drinks', 'leisure', 'activity'], Math.ceil(Math.random() * 5)),
      isDeleted: false,
    });
  }
}
