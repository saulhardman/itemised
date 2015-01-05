utils = {
  getToday: function getToday() {
    var date = new Date();

    date.setHours(0);

    date.setMinutes(0);

    date.setSeconds(0);

    date.setMilliseconds(0);
  
    return date;
  },
  getFirstDayOfTheWeek: function getFirstDayOfTheWeek() {
      var date = new Date();

      date.setDate(date.getDate() - date.getDay());

      date.setHours(0);

      date.setMinutes(0);

      date.setSeconds(0);

      date.setMilliseconds(0);
  
      return date;
  },
  getLastDayOfTheWeek: function getLastDayOfTheWeek() {
      var date = new Date();

      date.setDate(date.getDate() + (7 - date.getDay()));

      date.setHours(0);

      date.setMinutes(0);

      date.setSeconds(0);

      date.setMilliseconds(0);
  
      return date;
  },
  getFirstDayOfTheMonth: function getFirstDayOfTheMonth() {
    var date = new Date();

    return new Date(date.getFullYear(), date.getMonth(), 1);
  },
  getLastDayOfTheMonth: function getLastDayOfTheMonth() {
    var date = new Date();
  
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
