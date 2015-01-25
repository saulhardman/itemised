Template.expenseNew.helpers({
  now: function () {
    var now = new Date();

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    return {
        date: now.toJSON().substring(0, 10),
        time: now.toJSON().substring(11, 16)
    };
  }
});

Template.expenseNew.events({
  'submit #js-expense-new': function (e, template) {
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

    Meteor.call('expenseInsert', {
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date,
      location: $location.val(),
      tagNames: _.compact(_.uniq($tags.val().split(',').map(function (value) {
        return value.trim().toLowerCase().split(' ').map(function (value) {
          return value.trim();
        }).join('-');
      })))
    });

    Router.go('/');

    return false;
  },
  'input .js-expense-tags': function (e, template) {
    var $this = $(e.currentTarget);
    var names = _.compact($this.val().split(',').map(function (value) {
      return value.trim().toLowerCase().split(' ').map(function (value) {
        return value.trim();
      }).join('-');
    }));
    var $tags = template.$('.js-tag-link');

    $tags.removeClass('tag__link--is-selected').filter(names.map(function (value) {
      return '.js-tag-link--' + value;
    }).join(', ')).addClass('tag__link--is-selected');
  },
  'click .js-tag-link': function (e, template) {
    e.preventDefault();

    var $this = $(e.currentTarget);
    var name = $this.find('.js-tag-name').text();
    var $tags = template.$('#tags');
    var names = _.compact($tags.val().split(',').map(function (value) { return value.trim(); }));
    var index;
    var value;

    if (names.indexOf(name) > -1) {
      names = _.without(names, name);
      
      $this.removeClass('tag__link--is-selected');
    } else {
      names.push(name);

      $this.addClass('tag__link--is-selected');
    }

    value = names.join(', ');

    if (names.length > 0) {
      value += ', ';
    }

    $tags.val(value).focus();

    return false;
  }
});

Template.expenseNew.rendered = function () {
  this.$('.js-expense-tags').trigger('input');
};
