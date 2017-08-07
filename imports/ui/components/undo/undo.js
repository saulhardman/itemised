import $ from 'jquery';
import Shake from 'shake.js';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Expenses } from '/imports/api/expenses/expenses';
import filteredTagIds from '/imports/ui/filteredTagIds';
import { restore, findArchived } from '/imports/api/expenses/methods';
import { types } from '/imports/api/notifications/notifications';
import utils from '/imports/ui/utils';

import { remove as notificationRemove } from '/imports/api/notifications/methods';

import './undo.html';

const undo = {
  isOpen: false,
  init(instance) {
    this.instance = instance;

    return this;
  },
  setup() {
    this.$element = $(this.instance.firstNode);
    this.$menu = this.$element.find('#js-undo-menu');

    this.shake = new Shake();

    this.bindUIEvents();

    return this;
  },
  destroy() {
    this.unBindUIEvents();

    this.instance =
    this.$element =
    this.$menu = null;

    return this;
  },
  bindUIEvents() {
    this.shake.start();

    $(window).on('shake', this.onShake.bind(this));

    return this;
  },
  unBindUIEvents() {
    this.shake.stop();

    $(window).off('shake');

    return this;
  },
  onShake() {
    const deleted = Expenses.find({ isArchived: true });

    if (this.isOpen || deleted.count() === 0) {
      return;
    }

    this.open();
  },
  open() {
    this.isOpen = true;

    this.$element.addClass('undo--is-open');

    this.$menu.addClass('undo--is-open__menu');

    notificationRemove.call({ type: types.undo });

    return this;
  },
  close() {
    if (!this.isOpen) {
      return this;
    }

    this.$element.removeClass('undo--is-open').on(utils.transitionEnd, () => {
      this.$element.off(utils.transitionEnd);

      this.isOpen = false;
    });

    this.$menu.removeClass('undo--is-open__menu');

    return this;
  },
  onClickUndo() {
    const lastExpenseDeleted = Expenses.findOne({ isArchived: true }, { sort: { archivedAt: -1 } });

    restore.call({ expenseId: lastExpenseDeleted._id });

    this.close();

    return this;
  },
  onClickArchive() {
    FlowRouter.go('expense.archive');

    return this;
  },
  onClickCancel() {
    this.close();

    return this;
  },
};

Template.undo.helpers({
  deletedCount() {
    return findArchived.call({ tagIds: filteredTagIds.get() }).count();
  },
});

Template.undo.onCreated(function onCreated() {
  this.undo = Object.create(undo).init(this);
});

Template.undo.onRendered(function onRendered() {
  this.undo.setup();
});

Template.undo.onDestroyed(function onDestroyed() {
  this.undo.destroy();

  this.undo = null;
});

Template.undo.events({
  'touchmove'(event) {
    event.preventDefault();
    event.stopPropagation();

    return false;
  },
  'click #js-undo-button'(event, instance) {
    instance.undo.onClickUndo(event);
  },
  'click #js-archive-button'(event, instance) {
    instance.undo.onClickArchive(event);
  },
  'click #js-cancel-button'(event, instance) {
    instance.undo.onClickCancel(event);
  },
});
