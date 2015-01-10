Template.expense.rendered = function () {
  this.fastClick = FastClick.attach(this.$('.js-expense')[0]);
};

Template.expense.destroyed = function () {
  this.fastClick.destroy();
};

Template.expense.helpers({
  hasTags: function () {
    return this.tags.length !== 0;
  }
});

Template.expense.events({
  'touchstart .js-tags, touchmove .js-tags, touchend .js-tags': function (event) {
    event.stopPropagation();
  },
  'touchstart .js-expense': function (event) {
    var touch;

    if (SlideToDelete.active) {
      return false;
    }

    SlideToDelete.active = true;

    touch = event.originalEvent.touches[0];

    this.slideToDelete = new SlideToDelete(event.currentTarget, {
      startedAt: touch.clientX,
      scrollPosition: touch.clientY,
    });
  },
  'touchmove .js-expense': function (event) {
    if (!this.slideToDelete.isDestroyed) {
      this.slideToDelete.move(event);
    }
  },
  'touchend .js-expense': function (event) {
    if (!this.slideToDelete.isDestroyed) {
      this.slideToDelete.close(this._id);
    }
  }
});

var SlideToDelete = function (element, options) {
  this.element = element;
  this.$element = $(element);

  this.startedAt = options.startedAt;
  this.scrollPosition = options.scrollPosition;

  this.$container = this.$element.find('.js-container');
  this.$content = this.$element.find('.js-content');

  return this;
};

SlideToDelete.active = false;

SlideToDelete.prototype = {
  moveThreshold: 48,
  deleteThreshold: 96,
  directions: { true: 'right', false: 'left' },
  scrollingThreshold: 12,
  isDestroyed: false,
  move: function move(event) {
    var touch = event.originalEvent.touches[0];
    var distance = touch.clientX - this.startedAt;
    var absDistance = Math.abs(distance);
    var scroll = Math.abs(touch.clientY - this.scrollPosition);
    var position;
    var absPosition;

    if (this.isMoving) {
      event.preventDefault();

      position = (touch.clientX - this.movedFrom);

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

    } else if (absDistance >= this.moveThreshold) {

      this.startMoving(touch.clientX, distance > 0);

    } else if (scroll >= this.scrollingThreshold) {

      this.destroy();

    }

    this.position = position;
  
    return this;
  },
  close: function close(id) {
    if (this.isDeletable &&
        Math.abs(this.position) >= this.deleteThreshold) {
      $.Velocity(this.$container, {
        translateX: { 'left': '-100%', 'right': '100%' }[this.direction]
      }, {
        duration: 200,
        queue: false,
        complete: function () {
          $.Velocity(this.$container, {
            height: 0,
          }, {
            duration: 200,
            complete: this.destroy.bind(this, id, true)
          });
        }.bind(this)
      });
    } else {
      $.Velocity(this.$content, {
        translateX: [0, this.position]
      }, {
        duration: 200,
        complete: this.destroy.bind(this, id, false)
      });
    }
  
    return this;
  },
  destroy: function destroy(id, remove) {
    if (remove) {
      Session.set('deleted', (Session.get('deleted') || []).concat([id]));

      Meteor.call('expenseDelete', id);
    }

    delete this.element;
    delete this.$element;
    delete this.$content;
    delete this.$icon;

    SlideToDelete.active = false;

    this.isDestroyed = true;
  
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

    this.$icon.attr('class', classes.join(' '));
  
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
