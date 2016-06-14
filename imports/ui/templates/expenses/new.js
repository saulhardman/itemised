import $ from 'jquery';
import compact from 'lodash.compact';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Router } from 'meteor/iron:router';
import min from 'lodash.min';
import moment from 'moment';
import times from 'lodash.times';
import uniq from 'lodash.uniq';
import without from 'lodash.without';

import { insert } from '/imports/api/expenses/methods';
import { Tags } from '/imports/api/tags/tags';
import utils from '/imports/ui/utils';

import './new.html';

const expenseNew = {
  init(instance) {
    this.instance = instance;

    return this;
  },
  setup() {
    this.$element = this.instance.$('#js-expense-new');
    this.$tagsInput = this.$element.find('.js-expense-tags');
    this.$tags = this.$element.find('.js-tag');

    this.setTagStates();

    return this;
  },
  onSubmitForm(event) {
    event.preventDefault();

    const $this = this.$element;
    const $amount = $this.find('.js-expense-amount');
    const $note = $this.find('.js-expense-note');
    const $date = $this.find('.js-expense-date');
    const $time = $this.find('.js-expense-time');
    const $location = $this.find('.js-expense-location');
    const date = moment($date.val()).hour($time.val());

    insert.call({
      amount: Math.round($amount.val() * 100),
      note: $note.val(),
      date: date.toDate(),
      location: $location.val(),
      tagNames: compact(uniq(this.$tagsInput.val().split(',').map(utils.slug))),
    });

    Router.go('/');

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

    Router.go('/');

    return false;
  },
  setTagStates() {
    const names = compact(this.$tagsInput.val().split(',').map(utils.slug));

    this.$tags.removeClass('tag--is-selected')
              .filter(names.map((value) => `.js-tag--${value}`).join(', '))
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

Template.expenseNew.helpers({
  tags() {
    return Tags.find();
  },
  dates() {
    const now = moment().add(1, 'day');

    return times(7, () => {
      const day = now.subtract(1, 'day');

      return {
        value: day.format('YYYY-MM-DD'),
        title: day.calendar(),
      };
    });
  },
  times() {
    const theHourNow = moment().get('hour');
    const differences = [];

    const arrayOfTimes = [8, 12, 16, 19, 22].map((hour, index) => {
      differences[index] = Math.abs(theHourNow - hour);

      return {
        value: hour,
        title: utils.getHumanTime(hour),
        selected: false,
      };
    });

    arrayOfTimes[differences.indexOf(min(differences))].selected = true;

    return arrayOfTimes;
  },
});

Template.expenseNew.events({
  'submit #js-expense-new'(event, instance) {
    instance.expenseNew.onSubmitForm(event);
  },
  'input .js-expense-tags'(event, instance) {
    instance.expenseNew.setTagStates();
  },
  'click .js-tag'(event, instance) {
    instance.expenseNew.onClickTag(event);
  },
  'click #js-cancel-button'(event, instance) {
    instance.expenseNew.onClickCancelButton(event);
  },
});

Template.expenseNew.onCreated(function onCreated() {
  this.expenseNew = Object.create(expenseNew).init(this);

  this.autorun(() => this.subscribe('tags', () => {
    Tracker.afterFlush(() => this.expenseNew.setup());
  }));
});

Template.expenseNew.onDestroyed(function onDestroyed() {
  this.expenseNew.destroy();

  this.expenseNew = null;
});
