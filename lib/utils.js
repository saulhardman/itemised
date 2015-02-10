utils = {
  transitionEnd: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
  prettyName: function prettyName(string) {
    return utils.capitalise(string.split('-').join(' '));
  },
  capitalise: function capitalise(string) {
    return string.split('')[0].toUpperCase() + string.substring(1);
  },
  parseCurrency: function parseCurrency(amount) {
    return '£' + this.parseAmount(amount);
  },
  parseAmount: function parseAmount(value) {
    return (value / 100).toFixed(2);
  },
  getDate: function getDate(date) {
    return date.toJSON().substring(0, 10);
  },
  getTime: function getTime(date) {
    return date.toJSON().substring(11, 16);
  },
  getToday: function getToday() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },
  getFirstDayOfTheWeek: function getFirstDayOfTheWeek() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  },
  getLastDayOfTheWeek: function getLastDayOfTheWeek() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (7 - date.getDay()));
  },
  getFirstDayOfTheMonth: function getFirstDayOfTheMonth() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), 1);
  },
  getLastDayOfTheMonth: function getLastDayOfTheMonth() {
    var date = new Date();
  
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },
  getFirstDayOfTheYear: function getFirstDayOfTheYear() {
    var date = new Date();
  
    return new Date(date.getFullYear(), 0, 1);
  },
  getLastDayOfTheYear: function getLastDayOfTheYear() {
    var date = new Date();

    return new Date(date.getFullYear(), 12, 0);
  },
  accumulator: function accumulator(array, property) {
    return array.reduce(function (previous, value) {
      if (typeof property === 'string') {
        return previous + parseInt(value[property], 10);
      }
      return previous + parseInt(value, 10);
    }, 0);
  },
};

if (Meteor.isClient) {

  $.fn.addBlockModifier = function (modifier) {
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
  };

  $.fn.removeBlockModifier = function (modifier) {
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
  };

  $.fn.toggleBlockModifier = function (modifier) {
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
  };

  $.fn.hasBlockModifier = function (modifier) {
    if (this.length === 0) {
      return this;
    }

    return this.get(0).classList.contains(this.data('block-name') + '--' + modifier);
  };

  $.fn.addElementModifier = function (modifier) {
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
  };

  $.fn.removeElementModifier = function (modifier) {
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
  };

  $.fn.toggleElementModifier = function (modifier) {
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
  };

  $.fn.hasElementModifier = function (modifier) {
    if (this.length === 0) {
      return this;
    }

    return this.get(0).classList.toString().indexOf('__' + this.data('element-name') + '--' + modifier) !== -1;
  };

}
