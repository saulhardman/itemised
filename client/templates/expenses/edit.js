var ExpenseEdit = function (template) {
  this.template = template;

  return this;
};

ExpenseEdit.prototype = {
  init: function init() {
    this.$element = this.template.$('#js-expense-edit');
    this.$tagsInput = this.$element.find('.js-expense-tags');
    this.$tags = this.$element.find('.js-tag');
    
    this.setTagStates();

    return this;
  },
  onSubmitForm: function onSubmitForm(e) {
    e.preventDefault();

    var $amount = this.$element.find('.js-expense-amount');
    var $note = this.$element.find('.js-expense-note');
    var $date = this.$element.find('.js-expense-date');
    var $time = this.$element.find('.js-expense-time');
    var $location = this.$element.find('.js-expense-location');
    var date = new Date($date.val());

    date.setHours($time.val().substring(0, 2));
    
    date.setMinutes($time.val().substring(3, 5));

    Meteor.call('expenseUpdate', this.template.data.expense, {
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date,
      location: $location.val(),
      tagNames: _.compact(_.uniq(this.$tagsInput.val().split(',').map(function (value) {
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

Template.expenseEdit.events({
  'submit #js-expense-edit': function (e, template) {
    template.expenseEdit.onSubmitForm(e);
  },
  'input .js-expense-tags': function (e, template) {
    template.expenseEdit.setTagStates();
  },
  'click .js-tag': function (e, template) {
    template.expenseEdit.onClickTag(e);
  }
});

Template.expenseEdit.created = function () {
  this.expenseEdit = new ExpenseEdit(this);
};

Template.expenseEdit.rendered = function () {
  this.expenseEdit.init();
};

Template.expenseEdit.destroyed = function () {
  this.expenseEdit.destroy();

  delete this.expenseEdit;
};
