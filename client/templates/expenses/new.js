var ExpenseNew = function (template) {
  this.template = template;

  return this;
};

ExpenseNew.prototype = {
  init: function init() {
    this.$element = this.template.$('#js-expense-new');
    this.$tagsInput = this.$element.find('.js-expense-tags');
    this.$tags = this.$element.find('.js-tag');
    
    this.setTagStates();

    return this;
  },
  onSubmitForm: function onSubmitForm(e) {
    e.preventDefault();

    var $this = this.$element;
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
  onClickTag: function onClickTag(e) {
    e.preventDefault();

    var $this = $(e.currentTarget);
    var name = $this.find('.js-tag-name').text();
    var names = _.compact(this.$tagsInput.val().split(',').map(function (value) { return value.trim(); }));
    var value;

    if (names.indexOf(name) > -1) {
      names = _.without(names, name);
      
      $this.removeClass('tag--is-selected');
    } else {
      names.push(name);

      $this.addClass('tag--is-selected');
    }

    value = names.join(', ');

    if (names.length > 0) {
      value += ', ';
    }

    this.$tagsInput.val(value).focus();

    return false;
  },
  setTagStates: function setTagStates() {
    var names = _.compact(this.$tagsInput.val().split(',').map(function (value) {
      return value.trim().toLowerCase().split(' ').map(function (value) {
        return value.trim();
      }).join('-');
    }));

    this.$tags.removeClass('tag--is-selected').filter(names.map(function (value) {
      return '.js-tag--' + value;
    }).join(', ')).addClass('tag--is-selected');
  
    return this;
  },
  destroy: function destroy() {
    delete this.$element;
    delete this.$tagsInput;
    delete this.$tags;
  
    return this;
  },
};

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
    template.expenseNew.onSubmitForm(e);
  },
  'input .js-expense-tags': function (e, template) {
    template.expenseNew.setTagStates();
  },
  'click .js-tag': function (e, template) {
    template.expenseNew.onClickTag(e);
  }
});

Template.expenseNew.created = function () {
  this.expenseNew = new ExpenseNew(this);
};

Template.expenseNew.rendered = function () {
  this.expenseNew.init();
};

Template.expenseNew.destroyed = function () {
  this.expenseNew.destroy();

  delete this.expenseNew;
};
