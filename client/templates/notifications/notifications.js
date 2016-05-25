Template.notifications.helpers({
  notifications() {
    return Notifications.find();
  },
});

var notificationUiHooks = {
  insertElement(node, next) {
    var $node = $(node).css('visibility', 'hidden');
    var height;

    $node.insertBefore(next);

    height = $node.height();

    $node.css('visibility', 'visible').height(0);

    $.Velocity($node, { height: height }).then(function () {
      $node.height('auto');
    });
  },
  removeElement(node) {
    var $node = $(node);

    $.Velocity($node, { height: 0 }).then(function () {
      $node.remove();
    });
  },
};

Template.notifications.rendered = function () {
  this.find('#js-notifications')._uihooks = notificationUiHooks;

  this.fastClick = FastClick.attach(this.firstNode);
};

Template.notifications.destroyed = function () {
  this.fastClick.destroy();

  this.fastClick = null;
};
