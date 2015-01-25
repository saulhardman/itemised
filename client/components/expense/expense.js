var Expense = function (template) {
  this.template = template;

  return this;
};

Expense.isScrolling = false;

Expense.prototype = {
  moveThreshold: 48,
  deleteThreshold: 96,
  directions: { true: 'right', false: 'left' },
  scrollingThreshold: 12,
  init: function init() {
    this.$element = this.template.$('.js-expense');
    this.$container = this.$element.find('.js-container');
    this.$content = this.$element.find('.js-content');

    this.$container.css('max-height', this.$container.height());

    this.isMoving = false;
    this.isClosing = false;

    this.fastClick = FastClick.attach(this.$element[0]);
  
    return this;
  },
  onTouchStart: function onTouchStart(e) {
    var touch;

    if (this.isClosing) {
      return;
    }

    Expense.isScrolling = false;

    touch = e.originalEvent.touches[0];

    this.startedAt = {
      x: touch.clientX,
      y: touch.clientY
    };
  
    return this;
  },
  onTouchMove: function onTouchMove(e) {
    if (Expense.isScrolling || this.isClosing) {
      return;
    }

    var touch = e.originalEvent.touches[0];
    var distance = touch.clientX - this.startedAt.x;
    var absDistance = Math.abs(distance);
    var scrollDistance = Math.abs(touch.clientY - this.startedAt.y);

    if (this.isMoving) {

      e.preventDefault();

      this.move(touch);

    } else if (absDistance >= this.moveThreshold) {

      this.startMoving(touch.clientX, distance > 0);

    } else if (scrollDistance >= this.scrollingThreshold) {

      this.scrollDetected();

    }
    
    return this;
  },
  onTouchEnd: function onTouchEnd() {
    if (Expense.isScrolling) {
      this.allowMoving();

      return;
    }

    if (!this.isMoving || this.isClosing) {
      return;
    }

    this.isClosing = true;

    if (this.isDeletable) {

      this.$container.addClass('expense__container--is-exiting-' + this.direction).css('max-height', 0).one(utils.transitionEnd, function (e) {
        if (e.originalEvent.propertyName === 'max-height') {
          this.remove();
        }
      }.bind(this));

    } else {

      this.$content.addClass('expense__content--is-reset').css('transform', 'translateX(0)').one(utils.transitionEnd, function () {
        this.$content.removeClass('expense__content--is-reset');

        this.reset();
      }.bind(this));

    }
  
    return this;
  },
  move: function move(touch) {
    var position = touch.clientX - this.movedFrom;
    var absPosition;

    if ((this.direction === 'left' && position > 0) ||
        (this.direction === 'right' && position < 0)) {

      position = 0;

    }

    if (this.isDeletable) {

      position = this.calculateFriction(position);

      this.$icon.css('transform', 'translateX(' + this.getIconPosition(position) + 'px)');

    }

    absPosition = Math.abs(position);

    this.$content.css('transform', 'translateX(' + position + 'px)');

    if (this.isDeletable && absPosition < this.deleteThreshold) {

      this.undeletable();

    } else if (!this.isDeletable && absPosition >= this.deleteThreshold) {

      this.deletable();

    }
  
    return this;
  },
  scrollDetected: function scrollDetected() {
    Expense.isScrolling = true;
  
    return this;
  },
  allowMoving: function allowMoving() {
    Expense.isScrolling = false;
  
    return this;
  },
  reset: function reset() {

    this.isMoving = false;
    this.isDeletable = false;
    this.isClosing = false;

    delete this.direction;
    delete this.$icon;
  
    return this;
  },
  remove: function remove() {
    var id = this.template.data._id;

    Session.set('deleted', (Session.get('deleted') || []).concat([id]));

    Meteor.call('expenseDelete', id);

    this.destroy();
  },
  destroy: function destroy() {
    this.fastClick.destroy();

    delete this.movedFrom;
    delete this.element;
    delete this.$element;
    delete this.$content;
    delete this.$icon;

    return this;
  },
  startMoving: function startMoving(position, direction) {
    this.isMoving = true;

    this.movedFrom = position;

    this.direction = this.directions[direction];

    this.$icon = this.$element.find('.js-delete-icon--' + this.directions[!direction]).show();

    this.$element.find('.js-delete-icon--' + this.direction).hide();
  
    return this;
  },
  deletable: function deletable() {
    var classes = this.$icon.attr('class').split(' ');

    this.isDeletable = true;

    classes.push('expense__delete-icon--is-active');

    this.$icon.attr('class', classes.join(' '));
  
    return this;
  },
  undeletable: function undeletable() {
    var classes = this.$icon.attr('class').split(' ');

    this.isDeletable = false;

    classes.splice(classes.indexOf('expense__delete-icon--is-active'), 1);

    this.$icon.attr('class', classes.join(' ')).css('transform', 'translateX(0)');
  
    return this;
  },
  calculateFriction: function calculateFriction(position) {
    var sign = position >= 0 ? 1 : -1;
    var absPosition = Math.abs(position);
  
    return Math.floor(this.deleteThreshold + ((absPosition - this.deleteThreshold) * (this.deleteThreshold / absPosition))) * sign;
  },
  getIconPosition: function getIconPosition(position) {
    var sign = position >= 0 ? 1 : -1;
    var absPosition = Math.abs(position);
  
    return (absPosition - this.deleteThreshold) * sign;
  },
};

Template.expense.created = function () {
  this.expense = new Expense(this);
};

Template.expense.rendered = function () {
  this.expense.init();
};

Template.expense.destroyed = function () {
  this.expense.destroy();

  delete this.expense;
};

Template.expense.helpers({
  hasTags: function () {
    return this.tags.length !== 0;
  }
});

Template.expense.events({
  'click .js-expense': function (e, template) {
    Router.go('expense.edit', { _id:  template.data._id });
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
  }
});
