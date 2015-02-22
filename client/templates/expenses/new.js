var ExpenseNew = function (template) {
  this.template = template;

  return this;
};

ExpenseNew.prototype = {
  init: function init() {
    this.$element = $(this.template.firstNode);
    this.$tagsInput = this.$element.find('.js-expense-tags');
    this.$tags = this.$element.find('.js-tag');
    
    this.setTagStates();

    this.fastClick = FastClick.attach(this.template.firstNode);

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
    var date = moment($date.val()).hour($time.val());

    Meteor.call('expenseInsert', {
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date.toDate(),
      location: $location.val(),
      tagNames: _.compact(_.uniq(this.$tagsInput.val().split(',').map(utils.slug)))
    });

    Router.go('/');

    return false;
  },
  onClickTag: function onClickTag(e) {
    e.preventDefault();

    var $this = $(e.currentTarget);
    var name = utils.slug($this.find('.js-tag-name').text());
    var names = _.compact(this.$tagsInput.val().split(',').map(utils.slug));
    var value;

    if (names.indexOf(name) > -1) {
      names = _.without(names, name);
      
      $this.removeClass('tag--is-selected');
    } else {
      names.push(name);

      $this.addClass('tag--is-selected');
    }

    value = names.map(utils.prettyName).join(', ');

    if (names.length > 0) {
      value += ', ';
    }

    this.$tagsInput.val(value).focus();

    return false;
  },
  setTagStates: function setTagStates() {
    var names = _.compact(this.$tagsInput.val().split(',').map(utils.slug));

    this.$tags.removeClass('tag--is-selected').filter(names.map(function (value) {
      return '.js-tag--' + value;
    }).join(', ')).addClass('tag--is-selected');
  
    return this;
  },
  destroy: function destroy() {
    this.fastClick.destroy();

    delete this.$element;
    delete this.$tagsInput;
    delete this.$tags;
  
    return this;
  },
};

Template.expenseNew.helpers({
  dates: function () {
    var now = moment().add(1, 'day');

    return _(7).times(function () {
      var day = now.subtract(1, 'day');

      return {
        value: day.format('YYYY-MM-DD'),
        title: day.calendar(),
      };
    });
  },
  times: function () {
    var theHourNow = moment().get('hour');
    var differences = [];
    var times;

    times = _.map([8, 12, 16, 19, 22], function (hour, index) {
      differences[index] = Math.abs(theHourNow - hour);

      return {
        value: hour,
        title: utils.getHumanTime(hour),
        selected: false,
      };
    });

    times[differences.indexOf(_.min(differences))].selected = true;

    return times;
  },
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
