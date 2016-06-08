import $ from 'jquery';
import compact from 'lodash.compact';
import { Meteor } from 'meteor/meteor';
import trim from 'lodash.trim';

const utils = {
  transitionEnd: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
  slug(string) {
    return compact(trim(string).toLowerCase().split(' ')).join('__');
  },
  prettyName(string) {
    return utils.capitalise(string.split('__').join(' '));
  },
  capitalise(string) {
    return string.split('')[0].toUpperCase() + string.substring(1);
  },
  parseCurrency(amount) {
    return `£${this.parseAmount(amount)}`;
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
    const date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },
  getFirstDayOfTheWeek() {
    const date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  },
  getLastDayOfTheWeek() {
    const date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (7 - date.getDay()));
  },
  getFirstDayOfTheMonth() {
    const date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), 1);
  },
  getLastDayOfTheMonth() {
    const date = new Date();

    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },
  getFirstDayOfTheYear() {
    const date = new Date();

    return new Date(date.getFullYear(), 0, 1);
  },
  getLastDayOfTheYear() {
    const date = new Date();

    return new Date(date.getFullYear(), 12, 0);
  },
  accumulator(array, property) {
    return array.reduce((previous, value) => {
      if (typeof property === 'string') {
        return previous + parseInt(value[property], 10);
      }

      return previous + parseInt(value, 10);
    }, 0);
  },
  getSearchObject(search = window.location.search) {
    if (search === '') {
      return {};
    }

    return search.replace('?', '').split('&').reduce((searchObject, value) => {
      const parts = value.split('=');

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

    const blockName = this.data('block-name');
    const modifierClassName = `${blockName}--${modifier}`;

    this.addClass(modifierClassName);

    this.find(`[class*="${blockName}__"]`).each(function addModifierToChildren() {
      const $element = $(this);
      const classList = $element.get(0).classList;
      const classNames = classList.toString().split(' ');

      const newClassNames = classNames.reduce((value, className) => {
        if (className.indexOf(blockName) !== -1) {
          value.push(className.replace(blockName, modifierClassName));
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

    const blockName = this.data('block-name');
    const modifierClassName = `${blockName}--${modifier}`;

    this.get(0).classList.remove(modifierClassName);

    this.find(`[class*="${blockName}__"]`).each(function removeModifierFromChildren() {
      const $element = $(this);
      const classList = $element.get(0).classList;
      const classNames = classList.toString().split(' ');

      classNames.forEach((className) => {
        if (className.indexOf(modifierClassName) !== -1) {
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

    return this.get(0).classList.contains(`${this.data('block-name')}--${modifier}`);
  },
  addElementModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

    const elementName = this.data('element-name');
    const classList = this.get(0).classList;
    const classNames = classList.toString().split(' ');

    const newClassNames = classNames.reduce((value, className) => {
      if (className.indexOf(`__${elementName}`) !== -1 &&
          className.indexOf(`__${elementName}--`) === -1) {
        value.push(className.replace(elementName, `${elementName}--${modifier}`));
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

    const elementName = this.data('element-name');
    const classList = this.get(0).classList;
    const classNames = classList.toString().split(' ');

    const oldClassNames = classNames.map((className) => {
      if (className.indexOf(`__${elementName}--${modifier}`) !== -1) {
        return className;
      }

      return undefined;
    });

    classList.remove.apply(classList, oldClassNames);

    return this;
  },
  toggleElementModifier(modifier) {
    if (this.length === 0) {
      return this;
    }

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

    const classListString = this.get(0).classList.toString();

    return (classListString.indexOf(`__${this.data('element-name')}--${modifier}`) !== -1);
  },
};

if (Meteor.isClient) {
  Meteor.startup(() => {
    $.fn.extend({
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

export default utils;
