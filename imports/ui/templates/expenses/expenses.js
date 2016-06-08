import $ from 'jquery';
import velocity from 'velocity-animate';

import timings from '/imports/ui/timings';

export const expensesUiHooks = {
  insertElement(node, next) {
    const $node = $(node).css({ visibility: 'hidden', position: 'absolute' });
    const $container = $node.find('.js-container').css({ transform: 'translateX(-100%)' });

    $node.insertBefore(next);

    const height = $node.outerHeight();

    $node.height(0).css({
      visibility: 'visible',
      position: 'static',
    });

    velocity(
      $node,
      { height },
      { duration: timings.fastest, easing: 'ease' }
    ).then(() => {
      $node.height('auto');

      return velocity(
        $container,
        { translateX: ['0%', '-100%'] },
        { duration: timings.fast, easing: 'ease' }
      );
    });
  },
  removeElement(node) {
    const $node = $(node);
    let translate;

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

    velocity(
      $node,
      { translateX: [translate, 0] },
      { duration: timings.fast, easing: 'ease' }
    ).then(() => {
      $node.removeBlockModifier('is-open');

      return velocity(
        $node,
        { height: 0 },
        { duration: timings.fastest, easing: 'ease' }
      );
    }).then(() => $node.remove());
  },
};
