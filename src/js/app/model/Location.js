define(["knockout"], function(ko) {
  "use strict";
  return function Location(name) {
    this.name = ko.observable(name);
  };
});
