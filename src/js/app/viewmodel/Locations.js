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

    // non-persisted Google Maps object array
    // indexed by location name
    // mapobject = { name: (Name of marker), marker: (Google Maps Marker object), info: (Google Maps InfoWindow object) }
    self.mapObjects = {};

    // non-persisted Google Maps active info window
    // used to close the last active window when next info window is opened
    self.activeInfoWindow = null;

    self.addMarker = function(name) {
      if (self.mapObjects[name]) return;

      self.geocoder.geocode({ address: name }, function(results, status) {
        if (status == gmaps.GeocoderStatus.OK) {

          var position = results[0].geometry.location;

          var content = '<h2>' + name + '</h2>' + 
            '<p>infowindow content here!</p>';

          var marker = new gmaps.Marker({
            map: self.map,
            position: position,
            title: name
          });

          var info = new gmaps.InfoWindow({
            content: content
          });

          gmaps.event.addListener(marker, 'click', function() {
            if(self.activeInfoWindow) {
              self.activeInfoWindow.close();
            }

            info.open(self.map, marker);

            self.activeInfoWindow = info;
          });

          self.mapObjects[name] = {
            name: name,
            marker: marker,
            info: info
          };

          self.map.setCenter(position);

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

    self.locationClickEventHandler = function(location) {
      var name = location.name();
      if (!self.mapObjects[name]) return;

      var marker = self.mapObjects[name].marker;
      var info = self.mapObjects[name].info;

      if(self.activeInfoWindow) {
        self.activeInfoWindow.close();
      }

      info.open(self.map, marker);

      self.activeInfoWindow = info;
    };

    self.remove = function(location) {
      self.removeMarker(location.name());
      self.locations.remove(location);
    };

    self.removeMarker = function(name) {
      if (!self.mapObjects[name]) return;
      self.mapObjects[name].marker.setMap(null);
      delete self.mapObjects[name].name;
      delete self.mapObjects[name].marker;
      delete self.mapObjects[name].info;
      delete self.mapObjects[name];
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
