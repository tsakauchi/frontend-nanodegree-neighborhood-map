define([
  "knockout"
], function(ko) {
  "use strict";
  
  return function Location(name) {
    var self = this;

    self.name = ko.observable(name);
    self.position = null;
    self.marker = null;
    self.info = null;

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
