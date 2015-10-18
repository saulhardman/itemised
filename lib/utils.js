utils = {
  transitionEnd: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
  slug(string) {
    return _.compact(string.trim().toLowerCase().split(' ')).join('__');
  },
  prettyName(string) {
    return utils.capitalise(string.split('__').join(' '));
  },
  capitalise(string) {
    return string.split('')[0].toUpperCase() + string.substring(1);
  },
  parseCurrency(amount) {
    return '£' + this.parseAmount(amount);
  },
  parseAmount(value) {
    return (value / 100).toFixed(2);
  },
  getDate(date) {
    return date.toJSON().substring(0, 10);
  },
  getTime(date) {
    return date.toJSON().substring(11, 16);
  },
  getToday() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },
  getFirstDayOfTheWeek() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  },
  getLastDayOfTheWeek() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (7 - date.getDay()));
  },
  getFirstDayOfTheMonth() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), 1);
  },
  getLastDayOfTheMonth() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },
  getFirstDayOfTheYear() {
    var date = new Date();

    return new Date(date.getFullYear(), 0, 1);
  },
  getLastDayOfTheYear() {
    var date = new Date();

    return new Date(date.getFullYear(), 12, 0);
  },
  accumulator(array, property) {
    return array.reduce(function (previous, value) {
      if (typeof property === 'string') {
        return previous + parseInt(value[property], 10);
      }
      return previous + parseInt(value, 10);
    }, 0);
  },
  getSearchObject(search) {
    search = search || window.location.search;

    if (search === '') {
      return {};
    }

    return search.replace('?', '').split('&').reduce(function(searchObject, value) {
      var parts = value.split('=');

      if (parts[0] !== '' && parts[1] !== '') {
        searchObject[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
      }

      return searchObject;
    }, {});
  },
  getTimes() {
    return {
      8: 'Morning',
      12: 'Lunch',
      16: 'Afternoon',
      19: 'Evening',
      22: 'Night',
    };
  },
  getHumanTime(hour) {
    return this.getTimes()[hour];
  },
  addBlockModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    var blockName = this.data('block-name');

    modifier = blockName + '--' + modifier;

    this.addClass(modifier);

    this.find('[class*="' + blockName + '__"]').each(function () {
      var $element = $(this);
      var classList = $element.get(0).classList;
      var classNames = classList.toString().split(' ');
      var newClassNames = classNames.reduce(function (value, className) {
        if (className.indexOf(blockName) !== -1) {
          value.push(className.replace(blockName, modifier));
        }

        return value;
      }, []);

      classList.add.apply(classList, newClassNames);
    });

    return this;
  },
  removeBlockModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    var blockName = this.data('block-name');

    modifier = blockName + '--' + modifier;

    this.get(0).classList.remove(modifier);

    this.find('[class*="' + blockName + '__"]').each(function () {
      var $element = $(this);
      var classList = $element.get(0).classList;
      var classNames = classList.toString().split(' ');

      classNames.forEach(function (className) {
        if (className.indexOf(modifier) !== -1) {
          classList.remove(className);
        }
      });
    });

    return this;
  },
  toggleBlockModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    var blockName = this.data('block-name');

    if (this.hasBlockModifier(modifier)) {
      this.removeBlockModifier(modifier);
    } else {
      this.addBlockModifier(modifier);
    }

    return this;
  },
  hasBlockModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    return this.get(0).classList.contains(this.data('block-name') + '--' + modifier);
  },
  addElementModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    var elementName = this.data('element-name');
    var classList = this.get(0).classList;
    var classNames = classList.toString().split(' ');
    var newClassNames = classNames.reduce(function (value, className) {
      if (className.indexOf('__' + elementName) !== -1 &&
          className.indexOf('__' + elementName + '--') === -1) {
        value.push(className.replace(elementName, elementName + '--' + modifier));
      }

      return value;
    }, []);

    classList.add.apply(classList, newClassNames);

    return this;
  },
  removeElementModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    var elementName = this.data('element-name');
    var classList = this.get(0).classList;
    var classNames = classList.toString().split(' ');
    var oldClassNames = classNames.map(function (className) {
      if (className.indexOf('__' + elementName + '--' + modifier) !== -1) {
        return className;
      }
    });

    classList.remove.apply(classList, oldClassNames);

    return this;
  },
  toggleElementModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    var elementName = this.data('element-name');

    if (this.hasElementModifier(modifier)) {
      this.removeElementModifier(modifier);
    } else {
      this.addElementModifier(modifier);
    }

    return this;
  },
  hasElementModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    return this.get(0).classList.toString().indexOf('__' + this.data('element-name') + '--' + modifier) !== -1;
  },
};

if (Meteor.isClient) {

  Meteor.startup(() => {

    jQuery.fn.extend({
      addBlockModifier: utils.addBlockModifier,
      removeBlockModifier: utils.removeBlockModifier,
      toggleBlockModifier: utils.toggleBlockModifier,
      hasBlockModifier: utils.hasBlockModifier,
      addElementModifier: utils.addElementModifier,
      removeElementModifier: utils.removeElementModifier,
      toggleElementModifier: utils.toggleElementModifier,
      hasElementModifier: utils.hasElementModifier,
    });

  });

}
