var Undo = function (template) {
  this.template = template;

  return this;
};

Undo.prototype = {
  isOpen: false,
  init: function init() {
    this.$element = $(this.template.firstNode);
    this.$menu = this.$element.find('#js-undo-menu');

    this.shake = new Shake();
    this.fastClick = FastClick.attach(this.template.firstNode);

    this.bindEvents();
  
    return this;
  },
  destroy: function destroy() {
    this.unBindEvents();

    this.fastClick.destroy();
  
    delete this.template;
    delete this.$element;
    delete this.$menu;

    return this;
  },
  bindEvents: function bindEvents() {
    this.shake.start();

    $(window).on('shake', this.onShake.bind(this));
  
    return this;
  },
  unBindEvents: function unBindEvents() {
    this.shake.stop();

    $(window).off('shake');
  
    return this;
  },
  onShake: function onShake(e) {
    var deleted = Expenses.find({ isDeleted: true });

    if (this.isOpen || deleted.count() === 0) {
      return;
    }
  
    this.open();
  },
  open: function open() {
    this.isOpen = true;

    this.$element.addClass('undo--is-open');

    this.$menu.addClass('undo--is-open__menu');

    Meteor.call('notificationRemove', { type: Notifications.TYPES.UNDO });
  
    return this;
  },
  close: function close() {
    if (!this.isOpen) {
      return;
    }

    this.$element.removeClass('undo--is-open').on(utils.transitionEnd, function () {
      this.$element.off(utils.transitionEnd);

      this.isOpen = false;
    }.bind(this));

    this.$menu.removeClass('undo--is-open__menu');
  
    return this;
  },
  onClickUndo: function onClickUndo(e) {
    var lastExpenseDeleted = Expenses.findOne({ isDeleted: true }, { sort: { deletedAt: -1 } });

    Meteor.call('expenseRestore', lastExpenseDeleted._id);

    this.close();
  
    return this;
  },
  onClickArchive: function onClickArchive(e) {
    Router.go('expense.archive');
  
    return this;
  },
  onClickCancel: function onClickCancel(e) {
    this.close();
  
    return this;
  },
};

Template.undo.helpers({
  deletedCount: function () {
    return Expenses.find({ isDeleted: true }).count();
  }
});

Template.undo.created = function () {
  this.undo = new Undo(this);
};

Template.undo.rendered = function () {
  this.undo.init();
};

Template.undo.destroyed = function () {
  this.undo.destroy();

  delete this.undo;
};

Template.undo.events({
  'touchstart, touchmove, touchend, click': function (e) {
    e.preventDefault();
    e.stopPropagation();

    return false;
  },
  'click #js-undo-button': function (e, template) {
    template.undo.onClickUndo(e);
  },
  'click #js-archive-button': function (e, template) {
    template.undo.onClickArchive(e);
  },
  'click #js-cancel-button': function (e, template) {
    template.undo.onClickCancel(e);
  },
});
