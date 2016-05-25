let expenseEdit = {
  init(template) {
    this.template = template;

    return this;
  },
  setup() {
    this.$element = this.template.$('#js-expense-edit');
    this.$tagsInput = this.$element.find('.js-expense-tags');
    this.$tags = this.$element.find('.js-tag');

    this.setTagStates();

    this.fastClick = FastClick.attach(this.$element.get(0));

    return this;
  },
  onSubmitForm(e) {
    e.preventDefault();

    var $amount = this.$element.find('.js-expense-amount');
    var $note = this.$element.find('.js-expense-note');
    var $date = this.$element.find('.js-expense-date');
    var $time = this.$element.find('.js-expense-time');
    var $location = this.$element.find('.js-expense-location');
    var date = moment($date.val()).hour($time.val());

    Router.go('/');

    Meteor.call('expenseUpdate', this.template.data.expense._id, {
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date.toDate(),
      location: $location.val(),
      tagNames: _.compact(_.uniq(this.$tagsInput.val().split(',').map(utils.slug)))
    });

    return false;
  },
  onClickTag(e) {
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
  onClickCancelButton(e) {
    e.preventDefault();

    Router.go('/');

    return false;
  },
  setTagStates() {
    var names = _.compact(this.$tagsInput.val().split(',').map(utils.slug));

    this.$tags.removeClass('tag--is-selected').filter(names.map(function (value) {
      return '.js-tag--' + value;
    }).join(', ')).addClass('tag--is-selected');

    return this;
  },
  destroy() {
    this.fastClick.destroy();

    this.fastClick =
    this.$element =
    this.$tagsInput =
    this.$tags = null;

    return this;
  },
};

Template.expenseEdit.helpers({
  date() {
    return moment(this.expense.date).format('YYYY-MM-DD');
  },
  times() {
    var hour = moment(this.expense.date).get('hour');

    return _.map([8, 12, 16, 19, 22], function (value, index) {
      return {
        value: value,
        title: utils.getHumanTime(value),
        selected: hour === value,
      };
    });
  },
});

Template.expenseEdit.events({
  'submit #js-expense-edit': function (e, template) {
    template.expenseEdit.onSubmitForm(e);
  },
  'input .js-expense-tags': function (e, template) {
    template.expenseEdit.setTagStates();
  },
  'click .js-tag': function (e, template) {
    template.expenseEdit.onClickTag(e);
  },
  'click #js-cancel-button': function (e, template) {
    template.expenseEdit.onClickCancelButton(e);
  }
});

Template.expenseEdit.onCreated(function () {
  this.expenseEdit = Object.create(expenseEdit).init(this);
});

Template.expenseEdit.onRendered(function () {
  this.expenseEdit.setup();
});

Template.expenseEdit.onDestroyed(function () {
  this.expenseEdit.destroy();

  this.expenseEdit = null;
});
