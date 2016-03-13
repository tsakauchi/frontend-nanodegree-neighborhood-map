define([
  "app/globals",
  "jquery",
  "underscore",
  "knockout",
  "googlemaps",
  "app/model/Location"
], function(c, $, _, ko, gmaps, Location) {
  "use strict";

  return function Locations(locations, map) {
    var self = this;

    self.map = map;

    self.geocoder = new gmaps.Geocoder();

    self.locations = ko.observableArray(ko.utils.arrayMap(locations, function (location) {
      return new Location(location.name || {});
    }));

    self.filter = ko.observable("");

    // non-persisted marker array
    self.markers = {};

    self.addMarker = function(name) {
      if (self.markers[name]) return;
      self.geocoder.geocode({ address: name }, function(results, status) {
        if (status == gmaps.GeocoderStatus.OK) {
          self.map.setCenter(results[0].geometry.location);
          self.markers[name] = new gmaps.Marker({
            map: self.map,
            position: results[0].geometry.location
          });
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    };

    self.addLocation = function(name) {
      self.locations.push(new Location(name));
    };

    self.submitEventHandler = function(formElement) {
      var $form = $(formElement);
      var $locn = $form.find("#location");
      var name = $locn.val();

      self.addLocation(name);

      $locn.val("");
    };

    self.remove = function(location) {
      self.removeMarker(location.name());
      self.locations.remove(location);
    };

    self.removeMarker = function(name) {
      if (!self.markers[name]) return;
      self.markers[name].setMap(null);
      delete self.markers[name];
    };

    self.addAllMarkers = function() {
      ko.utils.arrayForEach(self.locations(), function(location) {
        self.addMarker(location.name());
      });
    };

    self.locationsFiltered = ko.computed(function() {
      if(!self.filter()) {
        self.addAllMarkers();
        return self.locations(); 
      } else {
        return ko.utils.arrayFilter(self.locations(), function(location) {
          var name = location.name();
          var filter = self.filter();
          var isFilterTextMatchName = (name.toLowerCase().indexOf(filter.toLowerCase()) > -1);
          if (isFilterTextMatchName)
          {
            self.addMarker(name);
            return true;
          } else {
            self.removeMarker(name);
            return false;
          }
        });
      }
    });

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
