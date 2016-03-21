define([
  "knockout"
], function(ko) {
  "use strict";
  
  // Location(name=string)
  // Main observable model that contains data
  // for a particular location.
  return function Location(name) {
    var self = this;

    // location name observable
    self.name = ko.observable(name);

    // non-persisted Google Map objects
    self.position = null;
    self.marker = null;
    self.infoWindow = null;

    // JSON returned by this function is what is persisted
    // in local storage.
    // (Google Map objects are too large to persist. Besides,
    //  they are derived from the name at runtime, so there
    //  is no need to persist Google Map objects.)
    self.persistedLocation = function () {
      return { name: self.name };
    };
  };
});
