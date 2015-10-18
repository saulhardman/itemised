let undo = {
  isOpen: false,
  init(template) {
    this.template = template;

    return this;
  },
  setup() {
    this.$element = $(this.template.firstNode);
    this.$menu = this.$element.find('#js-undo-menu');

    this.shake = new Shake();
    this.fastClick = FastClick.attach(this.template.firstNode);

    this.bindUIEvents();

    return this;
  },
  destroy() {
    this.unBindUIEvents();

    this.fastClick.destroy();

    this.template =
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
  onShake(e) {
    var deleted = Expenses.find({ isDeleted: true });

    if (this.isOpen || deleted.count() === 0) {
      return;
    }

    this.open();
  },
  open() {
    this.isOpen = true;

    this.$element.addClass('undo--is-open');

    this.$menu.addClass('undo--is-open__menu');

    Meteor.call('notificationRemove', { type: Notifications.TYPES.UNDO });

    return this;
  },
  close() {
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
  onClickUndo() {
    var lastExpenseDeleted = Expenses.findOne({ isDeleted: true }, { sort: { deletedAt: -1 } });

    Meteor.call('expenseRestore', lastExpenseDeleted._id);

    this.close();

    return this;
  },
  onClickArchive() {
    Router.go('expense.archive');

    return this;
  },
  onClickCancel() {
    this.close();

    return this;
  },
};

Template.undo.helpers({
  deletedCount() {
    return Expenses.find({ isDeleted: true }).count();
  },
});

Template.undo.onCreated(function () {
  this.undo = Object.create(undo).init(this);
});

Template.undo.onRendered(function () {
  this.undo.setup();
});

Template.undo.onDestroyed(function () {
  this.undo.destroy();

  this.undo = null;
});

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
