Router.route('/', function () {
  var expenses = Expenses.all().fetch();
  var tagCounts = Expenses.tagCounts();
  var totals = Expenses.totals();

  expenses.forEach(function (value) {
    value.tags = value.tags.map(function (value) {
      return {
        name: value,
        count: tagCounts[value],
        href: '/expenses/' + value
      };
    });
  });

  console.log('Expenses: ', expenses, totals);

  this.render('dashboard', {
    data: {
      expenses: expenses,
      totals: totals,
    }
  });
});

Router.route('/expenses/add', function () {
  this.render('addExpense');
});

Router.route('/expenses/(.*)', function () {
  var tags = this.params[0].split('/');
  var selector = { tags: { $in: tags } };
  var expenses = Expenses.all(selector).fetch();
  var tagCounts = Expenses.tagCounts();
  var totals = Expenses.totals(selector);

  expenses.forEach(function (value) {
    value.tags = value.tags.map(function (value) {
      var selected = tags.indexOf(value) > -1;
      var href = selected ? '/expenses/' + tags.filter(function (tag) { return tag !== value; }).join('/') : '/expenses/' + tags.concat([value]).join('/');

      if (href === '/expenses/') {
        href = '/';
      }

      return {
        name: value,
        count: tagCounts[value],
        selected: selected,
        href: href,
      };
    });
  });

  console.log('Expenses:', expenses.length, expenses);

  this.render('dashboard', {
    data: {
      expenses: expenses,
      totals: totals,
    }
  });
});
