define([
  "app/globals",
  "knockout",
  "app/model/Location"
], function(c, ko, Location) {
  "use strict";

  return function Locations(locations) {
    var self = this;

    self.locations = ko.observableArray(ko.utils.arrayMap(locations, function (location) {
      return new Location(location.name);
    }));

    self.add = function () {
      self.locations.push(new Location("Location 1"));
    };

    self.remove = function (location) {
      self.locations.remove(location);
    };

    // internal computed observable that fires whenever anything changes in Locations
    ko.computed(function () {
      // store a clean copy to local storage, which also creates a dependency
      // on the observableArray and all observables in each item
      window.localStorage.setItem(c.LOCAL_STORAGE_ITEM_KEY, ko.toJSON(self.locations));
    }).extend({
      rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' }
    }); // save at most twice per second
  };
});
