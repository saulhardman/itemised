import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { FlowRouter } from 'meteor/kadira:flow-router';

// Components
import '/imports/ui/components/expense/expense';
import '/imports/ui/components/icons/icons';
import '/imports/ui/components/notification/notification';
import '/imports/ui/components/tag/tag';
import '/imports/ui/components/totals/totals';
import '/imports/ui/components/undo/undo';

// Templates
import '/imports/ui/templates/expenses/archive';
import '/imports/ui/templates/expenses/edit';
import '/imports/ui/templates/header/header';
import '/imports/ui/templates/expenses/index';
import '/imports/ui/templates/expenses/new';
import '/imports/ui/templates/layout/layout';
import '/imports/ui/templates/notifications/notifications';

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('layout', { content: '404' });
  },
};

FlowRouter.route('/', {
  triggersEnter: [(context, redirect) => {
    redirect('/expenses');
  }],
});

FlowRouter.route('/expenses', {
  name: 'expense.index',
  action() {
    BlazeLayout.render('layout', { content: 'expenseIndex' });
  },
});

FlowRouter.route('/expenses/new', {
  name: 'expense.new',
  action() {
    BlazeLayout.render('layout', {
      content: 'expenseNew',
      title: 'Add Item',
    });
  },
});

FlowRouter.route('/expenses/:expenseId/edit', {
  name: 'expense.edit',
  action() {
    BlazeLayout.render('layout', {
      content: 'expenseEdit',
      title: 'Edit Item',
    });
  },
});

FlowRouter.route('/expenses/archive', {
  name: 'expense.archive',
  action() {
    BlazeLayout.render('layout', {
      content: 'expenseArchive',
      isArchive: true,
      title: 'Archive',
    });
  },
});
