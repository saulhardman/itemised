utils = {
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
