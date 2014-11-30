Template.addExpense.helpers({
  now: function () {
    var now = new Date();

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    return {
        date: now.toJSON().substring(0, 10),
        time: now.toJSON().substring(11, 16)
    };
  }
});

Template.addExpense.events({
  'submit #js-add-expense': function (e) {
    e.preventDefault();

    var $amount = $('#js-expense-amount');
    var $note = $('#js-expense-note');
    var $date = $('#js-expense-date');
    var $time = $('#js-expense-time');
    var date = new Date($date.val());

    date.setHours($time.val().substring(0, 2));
    
    date.setMinutes($time.val().substring(3, 5));

    Expenses.insert({
      createdBy: Meteor.userId(),
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date
    });

    Router.go('/');

    return false;
  }
});
