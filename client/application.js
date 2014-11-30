Router.route('/', function () {
  this.render('dashboard');
});

Router.route('/expenses/add', function () {
  this.render('addExpense');
});
