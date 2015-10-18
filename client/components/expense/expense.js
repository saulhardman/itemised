let expense = {
  moveThreshold: 12,
  functionThreshold: 68,
  directions: { true: 'right', false: 'left' },
  scrollingThreshold: 12,
  isScrolling: false,
  init(template) {
    this.template = template;

    if (template.data.isDeleted) {
      Object.assign(this, {
        leftFunction: Object.assign(this.expenseDestroy, {
          requiresConfirmation: true,
          confirmation: this.expenseDestroyConfirm,
        }),
        rightFunction: this.expenseRestore,
      });
    } else {
      Object.assign(this, {
        leftFunction: this.expenseDelete,
        rightFunction: this.expenseEdit,
      });
    }

    return this;
  },
  setup() {
    this.$element = $(this.template.firstNode);
    this.$container = this.$element.find('.js-container');
    this.$content = this.$element.find('.js-content');
    this.$additional = this.$element.find('.js-additional-information');

    this.setAdditionalHeight();

    this.setMaxHeight();

    this.fastClick = FastClick.attach(this.template.firstNode);

    this.$element.data('expense', this);

    return this;
  },
  setAdditionalHeight() {
    this.$additional
          .data('height', this.$additional.height())
          .height(0)
          .removeElementModifier('is-hidden');

    return this;
  },
  setMaxHeight(additional) {
    var height = this.$container.height();

    if (typeof additional === 'number') {
      height += additional;
    }

    this.$container.css('max-height', height);

    return this;
  },
  onTouchStart: function onTouchStart(e) {
    var touch;

    if (this.isClosing) {
      return;
    }

    expense.isScrolling = false;

    touch = e.originalEvent.touches[0];

    this.startedAt = {
      x: touch.clientX,
      y: touch.clientY
    };

    return this;
  },
  onTouchMove(e) {
    if (expense.isScrolling || this.isClosing) {
      return;
    }

    var touch = e.originalEvent.touches[0];
    var distance;
    var absDistance;
    var scrollDistance;

    if (this.isMoving) {

      e.preventDefault();

      this.move(touch);

    } else {

      distance = touch.clientX - this.startedAt.x;
      absDistance = Math.abs(distance);
      scrollDistance = Math.abs(touch.clientY - this.startedAt.y);

      if (absDistance >= this.moveThreshold) {

        e.preventDefault();

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

      return;
    }

    if (!this.isMoving) {
      return;
    }

    if (this.isClosing) {
      return;
    }

    this.isClosing = true;

    if (this.rightFunctionQueued) {

      if (this.rightFunction === this.expenseRestore) {

        this.$element.addClass('removed exit-right');

        $.Velocity(this.$container, { translateX: '100%' }, { duration: timings.fast, easing: 'ease' }).then(function () {
          this.$element.removeBlockModifier('is-open');

          return $.Velocity(this.$element, { height: 0 });
        }.bind(this)).then(this.rightFunction.bind(this));

      } else {

        this.rightFunction();

      }

    } else if (this.leftFunctionQueued && (!this.leftFunction.requiresConfirmation || this.leftFunction.confirmation())) {

      this.$element.addClass('removed exit-left');

      $.Velocity(this.$container, { translateX: '-100%' }, { duration: timings.fast, easing: 'ease' }).then(function () {
        this.$element.removeBlockModifier('is-open');

        return $.Velocity(this.$element, { height: 0 });
      }.bind(this)).then(this.leftFunction.bind(this));

    } else {

      $.Velocity(this.$icon, { translateX: [0, this.iconPosition] });

      $.Velocity(this.$content, { translateX: [0, this.position] }).then(this.reset.bind(this));

    }

    return this;
  },
  onTouchCancel(e) {
    if (expense.isScrolling) {
      this.allowMovement();

      return;
    }

    return this;
  },
  move(touch) {
    var position = touch.clientX - this.movedFrom;
    var iconPosition;
    var absPosition;

    if ((this.direction === 'left' && position > 0) ||
        (this.direction === 'right' && position < 0)) {
      position = 0;
    }

    if (this.rightFunctionQueued || this.leftFunctionQueued) {

      position = this.calculateFriction(position);

      iconPosition = this.getIconPosition(position);

      this.$icon.css('transform', 'translateX(' + iconPosition + 'px)');

    }

    absPosition = Math.abs(position);

    this.$content.css('transform', 'translateX(' + position + 'px)');

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
    this.position = 0;
    this.iconPosition = 0;
    this.isOpen = false;
    this.isAnimating = false;
    this.isMoving = false;
    this.isClosing = false;
    this.leftFunctionQueued = false;
    this.rightFunctionQueued = false;

    this.direction =
    this.$icon = null;

    return this;
  },
  expenseEdit() {
    var id = this.template.data._id;

    Router.go('expense.edit', { _id: id });

    return this;
  },
  expenseDelete() {
    var id = this.template.data._id;

    this.$element.addClass('exit-left');

    Meteor.call('expenseDelete', id);

    return this;
  },
  expenseRestore() {
    var id = this.template.data._id;

    this.$element.addClass('exit-right');

    Meteor.call('expenseRestore', id);

    return this;
  },
  expenseDestroy() {
    var id = this.template.data._id;

    this.$element.addClass('exit-left');

    Meteor.call('expenseDestroy', id);

    return this;
  },
  expenseDestroyConfirm() {
    return window.confirm('Are you sure you want to destroy this expense?');
  },
  destroy() {
    this.fastClick.destroy();

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
    var sign = position >= 0 ? 1 : -1;
    var absPosition = Math.abs(position);

    return Math.floor(this.functionThreshold + ((absPosition - this.functionThreshold) * (this.functionThreshold / absPosition))) * sign;
  },
  getIconPosition(position) {
    var sign = position >= 0 ? 1 : -1;
    var absPosition = Math.abs(position);

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

    return $.Velocity(this.$additional, { height: 0 }, { duration: timings.fastest, easing: 'easeInQuad' }).then(function () {
      this.setMaxHeight();

      this.isAnimating = false;
    }.bind(this));
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

    return $.Velocity(this.$additional, { height: this.$additional.data('height') }, { duration: timings.fastest, delay: timings.fastest, easing: 'easeOutQuad' }).then(function () {
      this.isAnimating = false;
    }.bind(this));
  },
  toggle() {
    if (this.isAnimating) {
      return this;
    }

    var isOpen = this.isOpen;

    if (isOpen) {
      return this.close();
    } else {
      return this.open();
    }
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

Template.expense.onCreated(function () {
  this.expense = Object.create(expense).init(this);
});

Template.expense.onRendered(function (what) {
  this.expense.setup();
});

Template.expense.onDestroyed(function () {
  this.expense.destroy();

  this.expense = null;
});

Template.expense.helpers({
  hasTags() {
    return this.tags.count() > 0;
  },
});

Template.expense.events({
  'click .js-expense-details': function (e, template) {
    e.preventDefault();

    template.expense.toggle();

    return false;
  },
  'click .js-tag': function (e) {
    e.stopPropagation();

    e.preventDefault();

    var tagIds = Session.get('filteredTagIds') || [];
    var tagId = $(e.currentTarget).data('id');
    var index;

    if ((index = tagIds.indexOf(tagId)) === -1) {
      tagIds.push(tagId);

      $(e.currentTarget).addClass('tag--is-selected');
    } else {
      tagIds.splice(index, 1);

      $(e.currentTarget).removeClass('tag--is-selected');
    }

    Session.set('filteredTagIds', tagIds);

    return false;
  },
  'click .js-expense-edit': function (e, template) {
    e.preventDefault();

    template.expense.expenseEdit();

    return false;
  },
  'click .js-expense-delete': function (e, template) {
    e.preventDefault();

    template.expense.expenseDelete();

    return false;
  },
  'click .js-expense-restore': function (e, template) {
    e.preventDefault();

    template.expense.expenseRestore();

    return false;
  },
  'click .js-expense-destroy': function (e, template) {
    e.preventDefault();

    if (template.expense.expenseDestroyConfirm()) {
      template.expense.expenseDestroy();
    }

    return false;
  },
  'touchstart .js-tags, touchmove .js-tags, touchend .js-tags': function (e) {
    e.stopPropagation();
  },
  'touchstart .js-expense': function (e, template) {
    template.expense.onTouchStart(e);
  },
  'touchmove .js-expense': function (e, template) {
    template.expense.onTouchMove(e);
  },
  'touchend .js-expense': function (e, template) {
    template.expense.onTouchEnd(e);
  },
  'touchcancel .js-expense': function (e, template) {
    template.expense.onTouchCancel(e);
  },
});
