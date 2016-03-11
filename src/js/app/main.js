define([
  "app/globals",
  "jquery",
  "underscore",
  "knockout",
  "app/viewmodel/Locations"
], function(c,$,_,ko,Locations) {
  $(function() {
    "use strict";

    var locations = ko.utils.parseJson(window.localStorage.getItem(c.LOCAL_STORAGE_ITEM_KEY));
    ko.applyBindings(new Locations(locations || []));
  });
});
