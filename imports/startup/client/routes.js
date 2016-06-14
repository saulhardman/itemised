import { Router } from 'meteor/iron:router';

// Components
import '/imports/ui/components/expense/expense';
import '/imports/ui/components/icons/icons';
import '/imports/ui/components/notification/notification';
import '/imports/ui/components/tag/tag';
import '/imports/ui/components/totals/totals';
import '/imports/ui/components/undo/undo';

// Layouts
import '/imports/ui/templates/expenses/archive';
import '/imports/ui/templates/expenses/edit';
import '/imports/ui/templates/expenses/index';
import '/imports/ui/templates/expenses/new';
import '/imports/ui/templates/header/header';
import '/imports/ui/templates/layout/layout';
import '/imports/ui/templates/loading/loading';
import '/imports/ui/templates/notifications/notifications';

Router.configure({ layoutTemplate: 'layout' });

Router.route('/', function redirectToExpenses() {
  this.redirect('/expenses');
});

Router.route('/expenses/new', { name: 'expense.new' });
Router.route('/expenses/:_id/edit', { name: 'expense.edit' });
Router.route('/expenses', { name: 'expense.index' });
Router.route('/archive', { name: 'expense.archive' });
