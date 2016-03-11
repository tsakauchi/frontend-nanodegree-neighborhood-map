define(["knockout"], function(ko) {
  "use strict";
  return function AppModel() {
    this.name = ko.observable("Knockout App");
    this.nameCaps = ko.pureComputed(function() {
      return this.name().toUpperCase();
    }, this);
  };
});
