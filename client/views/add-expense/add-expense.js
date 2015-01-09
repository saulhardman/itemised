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

    var $this = $(e.currentTarget);
    var $amount = $this.find('.js-expense-amount');
    var $note = $this.find('.js-expense-note');
    var $date = $this.find('.js-expense-date');
    var $time = $this.find('.js-expense-time');
    var $location = $this.find('.js-expense-location');
    var $tags = $this.find('.js-expense-tags');
    var date = new Date($date.val());

    date.setHours($time.val().substring(0, 2));
    
    date.setMinutes($time.val().substring(3, 5));

    console.log({
      createdBy: Meteor.userId(),
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date,
      location: $location.val(),
      tags: $tags.val().split(',').map(function (value) {
        return value.trim();
      }),
    });

    Expenses.collection.insert({
      createdBy: Meteor.userId(),
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date,
      location: $location.val(),
      tags: $tags.val().split(',').map(function (value) {
        return value.trim().toLowerCase();
      }).filter(function (value) {
        return value !== '';
      }),
      isDeleted: false,
    });

    Router.go('/');

    return false;
  }
});
