var Expense = function (template) {
  this.template = template;

  return this;
};

Expense.isScrolling = false;

Expense.prototype = {
  moveThreshold: 48,
  deleteThreshold: 68,
  directions: { true: 'right', false: 'left' },
  scrollingThreshold: 12,
  init: function init() {
    this.$element = $(this.template.firstNode);
    this.$container = this.$element.find('.js-container');
    this.$content = this.$element.find('.js-content');
    this.$additional = this.$element.find('.js-additional-information');
    this.$additionalItems = this.$additional.find('.js-additional-information-item');
    this.additionalItemCount = this.$additionalItems.length;

    this.$additional.data('height', this.$additional.height()).height(0).removeClass('expense__additional-information--is-hidden');

    this.isOpen = false;
    this.isAnimating = false;

    this.setMaxHeight();

    this.isMoving = false;
    this.isClosing = false;

    this.fastClick = FastClick.attach(this.$element[0]);
  
    return this;
  },
  setMaxHeight: function setMaxHeight(additional) {
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

    if (!this.isMoving) {
      this.toggleAdditionalInformation();

      return;
    }

    if (this.isClosing) {
      return;
    }

    this.isClosing = true;

    if (this.isDeletable) {

      if (this.direction === 'right') {

        this.$container.addClass('expense__container--is-exiting-' + this.direction).one(utils.transitionEnd, function () {
          Router.go('expense.edit', { _id: this.template.data._id });
        }.bind(this));

      } else {

        this.$element.removeBlockModifier('is-open');

        this.$container.addClass('expense__container--is-exiting-' + this.direction).css('max-height', 0).one(utils.transitionEnd, function (e) {
          if (e.originalEvent.propertyName === 'max-height') {
            this.remove();
          }
        }.bind(this));

      }

    } else {

      this.$content.addClass('expense__content--is-reset').css('transform', 'translateX(0)').one(utils.transitionEnd, function () {
        this.$content.removeClass('expense__content--is-reset');

        this.reset();
      }.bind(this));

    }
  
    return this;
  },
  onTouchCancel: function onTouchCancel(e) {
    if (Expense.isScrolling) {
      this.allowMoving();

      return;
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

    if (this.direction === 'right') {
      this.$icon = this.$element.find('.js-edit-icon').show();
      this.$element.find('.js-delete-icon').hide();
    } else {
      this.$icon = this.$element.find('.js-delete-icon').show();
      this.$element.find('.js-edit-icon').hide();
    }
  
    return this;
  },
  deletable: function deletable() {
    this.isDeletable = true;

    this.$icon.addElementModifier('is-active');
  
    return this;
  },
  undeletable: function undeletable() {
    this.isDeletable = false;

    this.$icon.removeElementModifier('is-active').css('transform', 'translateX(0)');
  
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
  toggleAdditionalInformation: function toggleAdditionalInformation() {
    if (this.isAnimating) {
      return this;
    }

    this.isAnimating = true;

    var duration = 200;
    var isOpen = this.isOpen;

    this.isOpen = !this.isOpen;

    this.$element.toggleBlockModifier('is-open');

    if (isOpen) {
      $.Velocity(this.$additional, { height: 0 }, { duration: duration, easing: 'easeInQuad' }).then(function () {
        this.setMaxHeight();

        this.isAnimating = false;
      }.bind(this));
    } else {
      $.Velocity(this.$additional, { height: this.$additional.data('height') }, { duration: duration, delay: duration, easing: 'easeOutQuad' }).then(function () {
        this.isAnimating = false;
      }.bind(this));

      this.setMaxHeight(this.$additional.data('height'));
    }
  
    return this;
  },
};

Template.expense.created = function () {
  this.expense = new Expense(this);
};

Template.expense.rendered = function () {
  this.expense.init();

  this.firstNode.parentNode._uihooks = {
    insertElement: function(node, next) {
      var $node = $(node).css({ visibility: 'hidden', position: 'absolute' });
      var height;
      var $container = $node.find('.js-container')
        .css({ transform: 'translateX(-100%)' });

      $node.insertBefore(next);

      height = $node.outerHeight();

      $node.height(0).css({ visibility: 'visible', position: 'static' });

      console.log(height);
      
      Deps.afterFlush(function() {
        $.Velocity($node, { height: height }, { duration: 400, easing: 'ease' }).then(function () {
          $container.velocity({ translateX: ['0%', '-100%'] }, { duration: 400, easing: 'ease' });
        });
      });
    },
  };
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
  'click .js-tag': function (e) {
    e.stopPropagation();

    e.preventDefault();

    var query = Router.current().params.query;
    var tagId = $(e.currentTarget).data('id');
    var index;

    if (query.hasOwnProperty('tags')) {
      if ((index = query.tags.indexOf(tagId)) !== -1) {
        query.tags.splice(index, 1);
      } else {
        query.tags.push(tagId);
      }
    } else {
      query.tags = [tagId];
    }

    Router.go('expense.index', {}, { query: query });

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
  }
});
