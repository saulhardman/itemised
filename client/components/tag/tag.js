Template.tag.helpers({
  selected: function () {
    var filteredTagIds;

    if ((filteredTagIds = Session.get('filteredTagIds') || []).length > 0) {
      return filteredTagIds.indexOf(this._id) !== -1;
    }

    return false;
  }
});
