var startPosition;
var moving = false;
var moveThreshold = 10;
var deleted = false;
var deleteThreshold = 50;

Template.expense.helpers({
  hasTags: function () {
    return this.tags.length !== 0;
  }
});

Template.expense.events({
  'touchstart .js-expense': function (event, template) {
    var touch = event.originalEvent.touches[0];

    startPosition = touch.clientX;
  },
  'touchmove .js-expense': function (event) {
    var $this = $(event.currentTarget);
    var touch = event.originalEvent.touches[0];
    var distance = touch.clientX - startPosition;
    var absDistance = Math.abs(distance);

    if (moving) {
      event.preventDefault();

      $this.css('transform', 'translateX(' + distance + 'px)');

      if (deleted && absDistance < deleteThreshold) {
        deleted = false;

        $this.removeClass('expense--is-deleted');
      } else if (absDistance >= deleteThreshold) {
        deleted = true;

        $this.addClass('expense--is-deleted');
      }
    } else if (absDistance >= moveThreshold) {
      moving = true;

      console.log('Moving!');
    }
  },
  'touchend .js-expense': function (event) {
    if (deleted) {
      Expenses.remove(this._id);
    }

    $(event.currentTarget).css('transform', 'translateX(0)');

    moving = false;
    deleted = false;
    startPosition = undefined;
  }
});
