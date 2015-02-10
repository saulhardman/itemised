# Itemised

A meteor app to keep track of your personal expenses in a minimal, itemised list.

## To do

### User accounts
- [ ] Add user accounts

### User flow
- [ ] Add an introduction template to the expenses list when no expenses are present

### Tag suggestions
- [x] Provide a list of tags to the `addExpense` view (ordered by count)
- [x] Render list of tags
- [x] Listen for click event on tags elements and add tag to tags input and mark tag as selected
- [x] Break tag out into its own block
- [ ] Make tags in 'filtered by' list clickable

### Expenses
- [x] Add location icon
- [x] Add date icon
- [x] Refactor drag to delete logic
- [x] Swipe right to edit expense
- [x] Only show note and amount by default
- [x] Show date, location, and tags on tap
- [ ] Bring new.js inline with edit.js
- [ ] Ask someone who knows something about Meteor how they would implement expense filtering by tag
- [ ] Provide 'back' functionality on the new/edit expense views

### Global totals
- [x] Add the total for the current week
- [x] Add the total for the current month
- [x] Add the total for the current year
- [x] Add the all time total
- [ ] Ask Blaise his opinion on totals

### Animations
- [ ] Figure out how/when to animate for smoother transitions

### Search
- [ ] Add search functionality

### Undo menu
- [x] On deleting an expense, keep a temporary record of it
- [x] Open menu on shake gesture
- [x] `Undo delete` option should restore the previously deleted expense
- [x] `Cancel` option should close the menu

### Miscellaneous
- [x] Add container to tag list to correctly position fade out at the right-hand-side
