Router.route('/', function () {
  var expenses = Expenses.all().fetch();

  var tagCounts = expenses.reduce(function (tagCounts, value) {
    value.tags.forEach(function (value) {
      if (!tagCounts.hasOwnProperty(value)) {
        tagCounts[value] = 1;
      } else {
        tagCounts[value] += 1;
      }
    });

    return tagCounts;
  }, {});

  var totals = [
    {
      name: 'total',
      amount: Expenses.total()
    },
    {
      name: 'today',
      amount: Expenses.dailyTotal()
    },
    {
      name: 'weekly',
      amount: Expenses.weeklyTotal()
    },
    {
      name: 'monthly',
      amount: Expenses.monthlyTotal()
    },
  ];

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

  this.render('dashboard', { data: { expenses: expenses, totals: totals } });
});

Router.route('/expenses/add', function () {
  this.render('addExpense');
});

Router.route('/expenses/(.*)', function () {
  var tags = this.params[0].split('/');
  var filteredExpenses = Expenses.find({ tags: { $in: tags } });
  var expenses = Expenses.find();
  var tagCounts = {};
  expenses.map(function (value) {
    value.tags.map(function (value) {
      if (!tagCounts.hasOwnProperty(value)) {
        tagCounts[value] = 1;
      } else {
        tagCounts[value] += 1;
      }
    });
  });
  filteredExpenses = filteredExpenses.map(function (value) {
    value.tags = value.tags.map(function (value) {
      var selected = tags.indexOf(value) > -1;
      var href = selected ? '/expenses/' + tags.filter(function (tag) { return tag !== value; }).join('/') : '/expenses/' + tags.concat([value]).join('/');
      if (href === '/expenses/') {
        href = '/';
      }
      console.log('Selected: ', value, selected, href);
      return { name: value, count: tagCounts[value], selected: selected, href: href };
    });
    return value;
  });
  console.log('Expenses:', filteredExpenses.length, filteredExpenses);
  this.render('dashboard', { data: { expenses: filteredExpenses, tag: this.params.tag } });
});
