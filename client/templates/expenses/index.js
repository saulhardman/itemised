Template.expenseIndex.rendered = function () {
  this.fastClick = FastClick.attach(this.firstNode.parentNode);

  this.find('#js-expenses')._uihooks = {
    insertElement: function (node, next) {
      var $node = $(node).css({ visibility: 'hidden', position: 'absolute' });
      var $container = $node.find('.js-container').css({ transform: 'translateX(-100%)' });
      var height;

      $node.insertBefore(next);

      height = $node.outerHeight();

      $node.height(0).css({
        visibility: 'visible',
        position: 'static'
      });
      
      $.Velocity($node, { height: height }, { duration: 400, easing: 'ease' }).then(function () {
        $node.height('auto');

        return $container.velocity({ translateX: ['0%', '-100%'] }, { duration: 400, easing: 'ease' });
      });
    },
    removeElement: function (node) {
      var $node = $(node);

      if ($node.hasBlockModifier('has-been-removed')) {
        $node.remove();

        return;
      }

      $node.addBlockModifier('is-animating');

      $.Velocity($node, { translateX: ['-100%', '0%'] }).then(function () {
        $node.removeBlockModifier('is-open');

        return $.Velocity($node, { height: 0 });
      }).then(function () {
        $node.remove();
      });
    },
  };
};

Template.expenseIndex.destroyed = function () {
  this.fastClick.destroy();
};
