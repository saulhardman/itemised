expensesUiHooks = {
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
    
    $.Velocity($node, { height: height }, { duration: timings.fast, easing: 'ease' }).then(function () {
      $node.height('auto');

      return $container.velocity({ translateX: ['0%', '-100%'] }, { duration: timings.fast, easing: 'ease' });
    });
  },
  removeElement: function (node) {
    var $node = $(node);
    var translate;

    if ($node.hasClass('removed')) {
      $node.remove();

      return;
    }

    if ($node.hasClass('exit-left')) {
      translate = '-100%';
    } else {
      translate = '100%';
    }

    $node.addBlockModifier('is-animating');

    $.Velocity($node, { translateX: [translate, 0] }, { duration: timings.fast, easing: 'ease' }).then(function () {
      $node.removeBlockModifier('is-open');

      return $.Velocity($node, { height: 0 }, { duration: timings.fast, easing: 'ease' });
    }).then(function () {
      $node.remove();
    });
  },
};
