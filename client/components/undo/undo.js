var Undo = function (template) {
  this.template = template;

  this.bindEvents();

  return this;
};

Undo.prototype = {
  isOpen: false,
  init: function init() {
    this.$element = this.template.$('#js-undo');
    this.$menu = this.template.$('#js-undo-menu');

    this.fastClick = FastClick.attach(this.$element[0]);
  
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
    $(window).on('shake', this.onShake.bind(this));
  
    return this;
  },
  unBindEvents: function unBindEvents() {
    $(window).off('shake');
  
    return this;
  },
  onShake: function onShake() {
    var deleted = Session.get('deleted');

    if (this.isOpen || (typeof deleted === 'undefined' || deleted.length === 0)) {
      return;
    }
  
    this.open();

    return this;
  },
  open: function open() {
    this.isOpen = true;

    this.$element.addClass('undo--is-open');

    this.$menu.addClass('undo--is-open__menu');
  
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
  onClickUndo: function onClickUndo() {
    var deleted = Session.get('deleted');
    var id = deleted.pop();

    Session.set('deleted', deleted);

    Meteor.call('expenseRestore', id);

    this.close();
  
    return this;
  },
  onClickCancel: function onClickCancel() {
    this.close();
  
    return this;
  },
};

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
  'touchstart, touchmove, touchend, click': function (event) {
    event.preventDefault();
    event.stopPropagation();

    return false;
  },
  'click #js-undo-button': function (event, template) {
    template.undo.onClickUndo(event);
  },
  'click #js-cancel-button': function (event, template) {
    template.undo.onClickCancel(event);
  },
});
