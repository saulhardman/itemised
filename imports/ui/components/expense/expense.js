import $ from 'jquery';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import velocity from 'velocity-animate';
import without from 'lodash.without';

import { archive, remove, restore } from '/imports/api/expenses/methods';
import filteredTagIds from '/imports/ui/filteredTagIds';
import timings from '/imports/ui/timings';

import './expense.html';

const expense = {
  moveThreshold: 12,
  functionThreshold: 68,
  directions: {
    true: 'right',
    false: 'left',
  },
  scrollingThreshold: 12,
  isScrolling: false,
  init(instance) {
    this.instance = instance;

    if (instance.data.isArchived) {
      Object.assign(this, {
        leftFunction: Object.assign(this.expenseDestroy, {
          requiresConfirmation: true,
          confirmation: this.expenseDestroyConfirm,
        }),
        rightFunction: this.expenseRestore,
      });
    } else {
      Object.assign(this, {
        leftFunction: this.expenseArchive,
        rightFunction: this.expenseEdit,
      });
    }

    return this;
  },
  setup() {
    this.$element = $(this.instance.firstNode);
    this.$container = this.$element.find('.js-container');
    this.$content = this.$element.find('.js-content');
    this.$additional = this.$element.find('.js-additional-information');

    this.setAdditionalHeight();

    this.setMaxHeight();

    this.$element.data('expense', this);

    return this;
  },
  setAdditionalHeight() {
    this.$additional
          .data('height', this.$additional.outerHeight())
          .height(0)
          .removeElementModifier('is-hidden');

    return this;
  },
  setMaxHeight(additional) {
    let height = this.$container.height();

    if (typeof additional === 'number') {
      height += additional;
    }

    this.$container.css('max-height', height);

    return this;
  },
  onTouchStart: function onTouchStart(event) {
    if (this.isClosing) {
      return this;
    }

    expense.isScrolling = false;

    const touch = event.originalEvent.touches[0];

    this.startedAt = {
      x: touch.clientX,
      y: touch.clientY,
    };

    return this;
  },
  onTouchMove(event) {
    if (expense.isScrolling || this.isClosing) {
      return this;
    }

    const touch = event.originalEvent.touches[0];

    if (this.isMoving) {
      event.preventDefault();

      this.move(touch);
    } else {
      const distance = touch.clientX - this.startedAt.x;
      const absDistance = Math.abs(distance);
      const scrollDistance = Math.abs(touch.clientY - this.startedAt.y);

      if (absDistance >= this.moveThreshold) {
        event.preventDefault();

        this.startMoving(touch.clientX, distance > 0);
      } else if (scrollDistance >= this.scrollingThreshold) {
        this.scrollDetected();
      }
    }

    return this;
  },
  onTouchEnd() {
    if (expense.isScrolling) {
      this.allowMovement();

      return this;
    }

    if (!this.isMoving) {
      return this;
    }

    if (this.isClosing) {
      return this;
    }

    this.isClosing = true;

    if (this.rightFunctionQueued) {
      if (this.rightFunction === this.expenseRestore) {
        this.$element.addClass('removed exit-right');

        velocity(
          this.$container,
          { translateX: '100%' },
          { duration: timings.fast, easing: 'ease' }
        ).then(() => {
          this.$element.removeBlockModifier('is-open');

          return velocity(
            this.$element,
            { height: 0 },
            { duration: timings.fastest, easing: 'ease' }
          );
        }).then(() => this.rightFunction());
      } else {
        this.rightFunction();
      }
    } else if (this.leftFunctionQueued &&
              (!this.leftFunction.requiresConfirmation || this.leftFunction.confirmation())) {
      this.$element.addClass('removed exit-left');

      velocity(
        this.$container,
        { translateX: '-100%' },
        { duration: timings.fast, easing: 'ease' }
      ).then(() => {
        this.$element.removeBlockModifier('is-open');

        return velocity(
          this.$element,
          { height: 0 },
          { duration: timings.fastest, easing: 'ease' }
        );
      }).then(() => this.leftFunction());
    } else {
      velocity(this.$icon, { translateX: [0, this.iconPosition] });

      velocity(this.$content, { translateX: [0, this.position] }).then(this.reset.bind(this));
    }

    return this;
  },
  onTouchCancel() {
    if (expense.isScrolling) {
      this.allowMovement();

      return this;
    }

    return this;
  },
  move(touch) {
    let position = touch.clientX - this.movedFrom;
    let iconPosition;

    if ((this.direction === 'left' && position > 0) ||
        (this.direction === 'right' && position < 0)) {
      position = 0;
    }

    if (this.rightFunctionQueued || this.leftFunctionQueued) {
      position = this.calculateFriction(position);

      iconPosition = this.getIconPosition(position);

      this.$icon.css('transform', `translateX(${iconPosition}px)`);
    }

    const absPosition = Math.abs(position);

    this.$content.css('transform', `translateX(${position}px)`);

    this.position = position;

    this.iconPosition = iconPosition;

    if (this.rightFunctionQueued && position < this.functionThreshold) {
      this.unQueueRightFunction();
    } else if (!this.rightFunctionQueued && position >= this.functionThreshold) {
      this.queueRightFunction();
    }

    if (this.leftFunctionQueued && absPosition < this.functionThreshold) {
      this.unqueueLeftFunction();
    } else if (!this.leftFunctionQueued && absPosition >= this.functionThreshold) {
      this.queueLeftFunction();
    }

    return this;
  },
  scrollDetected() {
    expense.isScrolling = true;

    return this;
  },
  allowMovement() {
    expense.isScrolling = false;

    return this;
  },
  reset() {
    this.position =
    this.iconPosition = 0;

    this.isAnimating =
    this.isMoving =
    this.isClosing =
    this.leftFunctionQueued =
    this.rightFunctionQueued = false;

    this.direction =
    this.$icon = null;

    return this;
  },
  expenseEdit() {
    const expenseId = this.instance.data._id;

    FlowRouter.go('expense.edit', { expenseId });

    return this;
  },
  expenseArchive() {
    const id = this.instance.data._id;

    this.$element.addClass('exit-left');

    archive.call({ expenseId: id });

    return this;
  },
  expenseRestore() {
    const id = this.instance.data._id;

    this.$element.addClass('exit-right');

    restore.call({ expenseId: id });

    return this;
  },
  expenseDestroy() {
    const id = this.instance.data._id;

    this.$element.addClass('exit-left');

    remove.call({ expenseId: id });

    return this;
  },
  expenseDestroyConfirm() {
    // eslint-disable-next-line no-alert
    return window.confirm('Are you sure you want to destroy this expense?');
  },
  destroy() {
    this.movedFrom =
    this.element =
    this.$element =
    this.$content =
    this.$icon = null;

    return this;
  },
  startMoving(position, direction) {
    this.isMoving = true;

    this.movedFrom = position;

    this.direction = this.directions[direction];

    if (this.direction === 'right') {
      this.$icon = this.$element.find('.js-left-icon').show();
      this.$element.find('.js-right-icon').hide();
    } else {
      this.$icon = this.$element.find('.js-right-icon').show();
      this.$element.find('.js-left-icon').hide();
    }

    return this;
  },
  queueRightFunction() {
    this.rightFunctionQueued = true;

    this.$icon.addElementModifier('is-active');

    return this;
  },
  unQueueRightFunction() {
    this.rightFunctionQueued = false;

    this.$icon.removeElementModifier('is-active').css('transform', 'translateX(0)');

    return this;
  },
  queueLeftFunction() {
    this.leftFunctionQueued = true;

    this.$icon.addElementModifier('is-active');

    return this;
  },
  unqueueLeftFunction() {
    this.leftFunctionQueued = false;

    this.$icon.removeElementModifier('is-active').css('transform', 'translateX(0)');

    return this;
  },
  calculateFriction(position) {
    const sign = position >= 0 ? 1 : -1;
    const absPosition = Math.abs(position);
    const x = (absPosition - this.functionThreshold);
    const y = (this.functionThreshold / absPosition);

    return Math.floor(this.functionThreshold + (x * y)) * sign;
  },
  getIconPosition(position) {
    const sign = position >= 0 ? 1 : -1;
    const absPosition = Math.abs(position);

    return (absPosition - this.functionThreshold) * sign;
  },
  close() {
    if (!this.isOpen ||
        this.isAnimating) {
      return this;
    }

    this.isAnimating = true;

    this.isOpen = !this.isOpen;

    this.$element.removeBlockModifier('is-open');

    return velocity(
      this.$additional,
      { height: 0 },
      { duration: timings.fastest, easing: 'easeInQuad' }
    ).then(() => {
      this.setMaxHeight();

      this.isAnimating = false;
    });
  },
  open() {
    if (this.isOpen ||
        this.isAnimating) {
      return this;
    }

    this.isAnimating = true;

    this.isOpen = !this.isOpen;

    this.$element.addBlockModifier('is-open');

    this.setMaxHeight(this.$additional.data('height'));

    return velocity(
      this.$additional,
      { height: this.$additional.data('height') },
      { duration: timings.fastest, delay: timings.fastest, easing: 'easeOutQuad' }
    ).then(() => {
      this.isAnimating = false;
    });
  },
  toggle() {
    if (this.isAnimating) {
      return this;
    }

    if (this.isOpen) {
      return this.close();
    }

    return this.open();
  },
};

Object.assign(expense, {
  position: 0,
  iconPosition: 0,
  isOpen: false,
  isAnimating: false,
  isMoving: false,
  isClosing: false,
});

Template.expense.onCreated(function onCreated() {
  this.expense = Object.create(expense).init(this);
});

Template.expense.onRendered(function onRendered() {
  this.expense.setup();
});

Template.expense.onDestroyed(function onDestroyed() {
  this.expense.destroy();

  this.expense = null;
});

Template.expense.helpers({
  hasTags() {
    return this.tagIds.length > 0;
  },
});

Template.expense.events({
  'click .js-expense-details'(event, instance) {
    event.preventDefault();

    instance.expense.toggle();

    return false;
  },
  'click .js-tag'(event) {
    event.preventDefault();

    const tagIds = filteredTagIds.get();
    const tagId = $(event.currentTarget).data('id');

    if (tagIds.includes(tagId)) {
      filteredTagIds.set(without(tagIds, tagId));

      $(event.currentTarget).removeClass('tag--is-selected');
    } else {
      filteredTagIds.set([...tagIds, tagId]);

      $(event.currentTarget).addClass('tag--is-selected');
    }

    return false;
  },
  'click .js-expense-edit'(event, instance) {
    event.preventDefault();

    instance.expense.expenseEdit();

    return false;
  },
  'click .js-expense-delete'(event, instance) {
    event.preventDefault();

    instance.expense.expenseArchive();

    return false;
  },
  'click .js-expense-restore'(event, instance) {
    event.preventDefault();

    instance.expense.expenseRestore();

    return false;
  },
  'click .js-expense-destroy'(event, instance) {
    event.preventDefault();

    if (instance.expense.expenseDestroyConfirm()) {
      instance.expense.expenseDestroy();
    }

    return false;
  },
  // eslint-disable-next-line max-len
  'touchstart .js-tags-container, touchmove .js-tags-container, touchend .js-tags-container'(event) {
    event.prevent = true;
  },
  'touchstart .js-expense'(event, instance) {
    if (!event.prevent) {
      instance.expense.onTouchStart(event);
    }
  },
  'touchmove .js-expense'(event, instance) {
    if (!event.prevent) {
      instance.expense.onTouchMove(event);
    }
  },
  'touchend .js-expense'(event, instance) {
    if (!event.prevent) {
      instance.expense.onTouchEnd(event);
    }
  },
  'touchcancel .js-expense'(event, instance) {
    if (!event.prevent) {
      instance.expense.onTouchCancel(event);
    }
  },
});
