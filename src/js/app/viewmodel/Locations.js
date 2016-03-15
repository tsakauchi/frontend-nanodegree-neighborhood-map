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
      return new Location(location.name);
    }));

    self.filter = ko.observable("");

    self.activeLocation = null;

    self.addMarker = function(location) {
      var marker = location.marker;

      // marker already exists, set map to show it
      if (marker) {
        marker.setMap(self.map);
        return;
      }

      var name = location.name();

      self.geocoder.geocode({ address: name }, function(results, status) {
        if (status == gmaps.GeocoderStatus.OK) {

          var position = results[0].geometry.location;

          var content = '<h2>' + name + '</h2>' + 
            '<p>infowindow content here!</p>';

          marker = new gmaps.Marker({
            map: self.map,
            position: position,
            title: name,
            animation: gmaps.Animation.DROP
          });

          var info = new gmaps.InfoWindow({
            content: content
          });

          location.position = position;
          location.marker = marker;
          location.info = info;

          gmaps.event.addListener(marker, 'click', function() {
            self.setActiveLocation(location);
          });

          self.map.setCenter(position);

        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    };

    self.add = function(location) {
      self.locations.push(location);
    };

    self.submitEventHandler = function(formElement) {
      var $form = $(formElement);
      var $locn = $form.find("#location");
      var name = $locn.val();

      self.add(new Location(name));

      $locn.val("");
    };

    self.locationClickEventHandler = function(location) {
      self.setActiveLocation(location);
    };

    self.setActiveLocation = function(location) {
      var name = location.name();
      var marker = location.marker;
      var info = location.info;

      if(self.activeLocation && self.activeLocation.info) {
        self.activeLocation.marker.setAnimation(null);
        self.activeLocation.info.close();
      }

      info.open(self.map, marker);

      self.activeLocation = location;
      self.activeLocation.marker.setAnimation(gmaps.Animation.BOUNCE);
    };

    self.remove = function(location) {
      self.removeMarker(location);
      self.locations.remove(location);
    };

    self.removeMarker = function(location) {
      location.marker.setMap(null);
    };

    self.addAllMarkers = function() {
      ko.utils.arrayForEach(self.locations(), function(location) {
        self.addMarker(location);
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
            self.addMarker(location);
            return true;
          } else {
            self.removeMarker(location);
            return false;
          }
        });
      }
    });

    // internal computed observable that fires whenever anything changes in Locations
    ko.computed(function () {
      var persistedLocations = [];

      ko.utils.arrayForEach(self.locations(), function(location) {
        persistedLocations.push(location.persistedLocation());
      });

      window.localStorage.setItem(c.LOCAL_STORAGE_ITEM_KEY, ko.toJSON(persistedLocations));
    }).extend({
      // save at most twice per second
      rateLimit: { timeout: 500, method: 'notifyWhenChangesStop' }
    });
  };
});
