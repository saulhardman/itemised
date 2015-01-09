var Undo = function (template) {
  this.template = template;

  this.bindEvents();

  return this;
};

Undo.prototype = {
  isOpen: false,
  init: function init() {
    this.$element = this.template.$('#js-undo-menu');

    this.height = this.$element.height();

    this.fastClick = FastClick.attach(this.$element[0]);
  
    return this;
  },
  destroy: function destroy() {
    this.unBindEvents();

    this.fastClick.destroy();
  
    delete this.template;
    delete this.$element;

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

    $.Velocity(this.$element, {
      translateY: -this.height
    });
  
    return this;
  },
  close: function close() {
    if (!this.isOpen) {
      return;
    }

    $.Velocity(this.$element, {
      translateY: [0, -this.height]
    }, {
      complete: function () {
        this.isOpen = false;
      }.bind(this)
    });
  
    return this;
  },
  onClickUndo: function onClickUndo() {
    var deleted = Session.get('deleted');
    var id = deleted.pop();

    Session.set('deleted', deleted);

    Expenses.collection.update({
      _id: id
    }, {
      $set: {
        isDeleted: false
      }
    });

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
  'click #js-undo': function (event, template) {
    template.undo.onClickUndo(event);
  },
  'click #js-cancel': function (event, template) {
    template.undo.onClickCancel(event);
  },
});
