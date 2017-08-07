import $ from 'jquery';
import compact from 'lodash.compact';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import moment from 'moment';
import uniq from 'lodash.uniq';
import without from 'lodash.without';

import { update, findOne } from '/imports/api/expenses/methods';
import { find as findTags } from '/imports/api/tags/methods';
import utils from '/imports/ui/utils';

import './edit.html';

const expenseEdit = {
  init(instance) {
    this.instance = instance;

    return this;
  },
  setup() {
    this.$element = this.instance.$('#js-expense-edit');
    this.$tagsInput = this.$element.find('.js-expense-tags');
    this.$tags = this.$element.find('.js-tag');

    this.setTagStates();

    return this;
  },
  onSubmitForm(event) {
    event.preventDefault();

    const $id = this.$element.find('#js-expense-id');
    const $amount = this.$element.find('.js-expense-amount');
    const $note = this.$element.find('.js-expense-note');
    const $date = this.$element.find('.js-expense-date');
    const $time = this.$element.find('.js-expense-time');
    const $location = this.$element.find('.js-expense-location');
    const date = moment($date.val()).hour($time.val());

    FlowRouter.go('/');

    update.call({
      expenseId: $id.val(),
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date.toDate(),
      location: $location.val(),
      tagNames: compact(uniq(this.$tagsInput.val().split(',').map(utils.slug))),
    });

    return false;
  },
  onClickTag(event) {
    event.preventDefault();

    const $this = $(event.currentTarget);
    const name = utils.slug($this.find('.js-tag-name').text());
    let names = compact(this.$tagsInput.val().split(',').map(utils.slug));
    let value;

    if (names.indexOf(name) > -1) {
      names = without(names, name);

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
  onClickCancelButton(event) {
    event.preventDefault();

    FlowRouter.go('/');

    return false;
  },
  setTagStates() {
    const names = compact(this.$tagsInput.val().split(',').map(utils.slug));

    this.$tags.removeClass('tag--is-selected')
              .filter(names.map((value) => `.js-tag--${value}`)
              .join(', '))
              .addClass('tag--is-selected');

    return this;
  },
  destroy() {
    this.$element =
    this.$tagsInput =
    this.$tags = null;

    return this;
  },
};

Template.expenseEdit.helpers({
  tagNames(tags) {
    return tags.map((tag) => tag.prettyName()).join(', ');
  },
  times(date) {
    const hour = moment(date).get('hour');

    return [8, 12, 16, 19, 22].map((value) => {
      const title = utils.getHumanTime(value);
      const selected = (hour === value);

      return {
        value,
        title,
        selected,
      };
    });
  },
});

Template.expenseEdit.events({
  'submit #js-expense-edit'(event, instance) {
    instance.expenseEdit.onSubmitForm(event);
  },
  'input .js-expense-tags'(event, instance) {
    instance.expenseEdit.setTagStates();
  },
  'click .js-tag'(event, instance) {
    instance.expenseEdit.onClickTag(event);
  },
  'click #js-cancel-button'(event, instance) {
    instance.expenseEdit.onClickCancelButton(event);
  },
});

Template.expenseEdit.onCreated(function onCreated() {
  const expenseId = FlowRouter.getParam('expenseId');

  this.expenseEdit = Object.create(expenseEdit).init(this);

  this.autorun(() => {
    this.subscribe('expenses');
    this.subscribe('tags');

    if (this.subscriptionsReady()) {
      // NOTE: this disables reactivity
      this.data.tags = findTags.call({});
      this.data.expense = findOne.call({ expenseId });

      Tracker.afterFlush(() => this.expenseEdit.setup());
    }
  });
});

Template.expenseEdit.onDestroyed(function onDestroyed() {
  this.expenseEdit.destroy();

  this.expenseEdit = null;
});
