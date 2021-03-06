define([
  "app/globals",
  "jquery",
  "underscore",
  "knockout",
  "googlemaps",
  "app/model/Location"
], function(c, $, _, ko, gmaps, Location) {
  "use strict";

  // Locations (locations=array of location JSON object, map=Google Map instance)
  // This is the main ViewModel object for the app
  // Responsible for handling UI events and updating the
  // observable array containing location observables
  return function Locations(locations, map) {
    var self = this;

    self.map = map;

    self.geocoder = new gmaps.Geocoder();

    self.bounds = new gmaps.LatLngBounds();

    self.locations = ko.observableArray(ko.utils.arrayMap(locations, function (location) {
      return new Location(location.name);
    }));

    self.locationText = ko.observable("");

    self.filter = ko.observable("");

    self.isFilterCaseSensitive = ko.observable(false);

    self.activeLocation = null;

    self.activeInfoWindow = null;

    // addMarker(location=location observable)
    // Adds a Google Maps Marker to the map.
    self.addMarker = function(location) {
      var marker = location.marker;

      // marker already exists, set map to show it
      if (marker) {
        marker.setMap(self.map);
        self.bounds.extend(marker.position);
        self.map.fitBounds(self.bounds);
        return;
      }

      var name = location.name();

      // query Google API using Geocoder to get map location
      // corresponding to the location name.
      self.geocoder.geocode({ address: name }, function(results, status) {
        if (status == gmaps.GeocoderStatus.OK) {

          var position = results[0].geometry.location;

          self.bounds.extend(position);

          marker = new gmaps.Marker({
            map: self.map,
            position: position,
            title: name,
            animation: gmaps.Animation.DROP
          });

          if (!self.activeInfoWindow) {
            self.activeInfoWindow = new gmaps.InfoWindow();

            gmaps.event.addListener(self.activeInfoWindow, 'closeclick', function() {
              self.setActiveLocation(null);
            });
          }

          location.position = position;
          location.marker = marker;

          gmaps.event.addListener(marker, 'click', function() {
            self.setActiveLocation(location);
          });

          location.infoWindowContent += '<h2>' + name + '</h2>';
          self.loadInfoWindowContentFromGoogleMaps(name, location);
          self.loadInfoWindowContentFromWikipedia(name, location);
          self.loadInfoWindowContentFromNewYorkTimes(name, location);

          self.map.fitBounds(self.bounds);

        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    };

    // loadInfoWindowContentFromGoogleMaps
    // Function responsible for loading Google StreetView image into the info window.
    self.loadInfoWindowContentFromGoogleMaps = function(searchText, location) {
      var width = 300;
      var height = 100;
      var streetviewUrl = "https://maps.googleapis.com/maps/api/streetview?size=" + width + "x" + height + "&location=" + searchText + "&heading=0&pitch=0";

      location.infoWindowContent += '<h3>Street View</h3>';
      location.infoWindowContent += '<img class="bgimg" src="' + streetviewUrl + '">'
    };

    // loadInfoWindowContentFromWikipedia
    // Function responsible for loading Wikipedia article into the info window.
    // This function will extract and add the first match to the info window.
    // This function uses JSONP.
    self.loadInfoWindowContentFromWikipedia = function(searchText, location) {
      var wikiUrlAction = 'action=opensearch';
      var wikiUrlSearch = 'search=' + searchText;
      var wikiUrlFormat = 'format=json';
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?' + wikiUrlAction + '&' + wikiUrlSearch + '&' + wikiUrlFormat;
      var wikiUrlErrorHandler = function(){
        location.infoWindowContent += '<h3>Wikipedia</h3>';
        location.infoWindowContent += '<p>Failed to get Wikipedia articles for ' + searchText + '</p>';
        clearTimeout();
      };
      var wikiUrlTimeoutHandler = setTimeout(wikiUrlErrorHandler,4000);
      var wikiUrlCallbackHandler = function(data) { 
        if(!data) return;
        if(!data[1]) return;
        if(!data[2]) return;
        if(!data[3]) return;

        var titles = data[1];
        var snippets = data[2];
        var web_urls = data[3];

        location.infoWindowContent += '<h3>Wikipedia</h3>';
        if (titles.length > 0) {
          location.infoWindowContent += '<p>' + snippets[0] + '</p>' + '<p>' + web_urls[0] + '</p>';
        } else {
          location.infoWindowContent += '<p>No Wikipedia entry found for ' + searchText + '</p>';
        }

        clearTimeout(wikiUrlTimeoutHandler);
      };

      $.ajax({
          url: wikiUrl,
          dataType: 'jsonp',
          type: 'POST',
          success: wikiUrlCallbackHandler
      });
    };

    // loadInfoWindowContentFromNewYorkTimes
    // Function responsible for loading New York Times article into the info window.
    // This function will extract and add the first match to the info window.
    // This function uses AJAX.
    self.loadInfoWindowContentFromNewYorkTimes = function(searchText, location) {
      var nytUrlFilteredQuery = 'fq=type_of_material:("News") AND "' + searchText + '"';
      var nytUrlSortOrder = 'sort=newest';
      var nytUrlFields = 'fl=headline,pub_date,snippet,web_url';
      var nytUrlApiKey = 'api-key=9df2b415e47006caa7d29120aeec20f6:9:74652536';
      var nytUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?' + nytUrlFilteredQuery + '&' + nytUrlSortOrder + '&' + nytUrlFields + '&' + nytUrlApiKey;
      var nytUrlCallbackHandler = function(data) {
          if(!data) return;
          if(!data.response) return;
          if(!data.response.docs) return;

          location.infoWindowContent += '<h3>New York Times</h3>';
          if (data.response.docs.length > 0) {
            var article = data.response.docs[0];
            location.infoWindowContent += '<h4>' + article.headline.main + '</h4>';
            location.infoWindowContent += '<p>' + article.snippet + '</p>' + '<p>' + article.web_url + '</p>';
          } else {
            location.infoWindowContent += '<p>No NYT entry found for ' + searchText + '</p>';
          }
      };
      var nytUrlErrorHandler = function(){
        location.infoWindowContent += '<h3>New York Times</h3>';
        location.infoWindowContent += '<p>Failed to get New York Times articles for ' + searchText + '</p>';
      };

      // New York Times Request
      $.getJSON(nytUrl,nytUrlCallbackHandler).fail(nytUrlErrorHandler);
    };

    // add(location=location observable)
    // Adds the location observable to the locations observable array
    self.add = function(location) {
      self.locations.push(location);
    };

    // submitEventHandler
    // Handles submit event from the location form.
    // Creates a new location observable and adds it to the array.
    self.submitEventHandler = function(formElement) {
      self.add(new Location(self.locationText()));
      self.locationText("");
    };

    // locationClickEventHandler(location=location observable)
    // Handles locaion click event (used by list items and markers)
    self.locationClickEventHandler = function(location) {
      self.setActiveLocation(location);
    };

    // setActiveLocation
    // Set the location observable passed in as the "active" location.
    // Active location is the location whose location is showing the info window.
    // This will also de-activate the previously active location.
    self.setActiveLocation = function(location) {

      if (self.activeLocation) {
        self.activeLocation.marker.setIcon("");
        self.activeLocation.marker.setAnimation(null);
      }

      if (self.activeInfoWindow) {
        self.activeInfoWindow.close();
      }

      if (location) {
        self.activeLocation = location;
        self.activeInfoWindow.setContent(self.activeLocation.infoWindowContent);
        self.activeInfoWindow.open(self.map, self.activeLocation.marker);
        // Google Map Icons
        // http://stackoverflow.com/questions/17746740/google-map-icons-with-visualrefresh
        self.activeLocation.marker.setIcon("http://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2");
        self.activeLocation.marker.setAnimation(gmaps.Animation.BOUNCE);
      }
    };

    // remove(location=location observable)
    // Removes the location observable passed in from the observable array
    self.remove = function(location) {
      self.removeMarker(location);
      self.locations.remove(location);
    };

    // removeMarker(location=location observable)
    // Removes the marker from the map
    self.removeMarker = function(location) {
      if(!location.marker) return;
      location.marker.setMap(null);
    };

    // addAllMarkers()
    // Adds markers to all of the locations in the array
    self.addAllMarkers = function() {
      ko.utils.arrayForEach(self.locations(), function(location) {
        self.addMarker(location);
      });
    };

    // delHotkeyDownHandler()
    // Delete active location
    self.delHotkeyDownHandler = function() {
      self.remove(self.activeLocation);
    };

    // escHotkeyDownHandler()
    // Clear filter and set cursor to filter textbox
    self.escHotkeyDownHandler = function() {
      self.filter("");
      $("#filter").focus();
    };

    // homeHotkeyDownHandler()
    // Set cursor to location textbox
    self.homeHotkeyDownHandler = function() {
      $("#locationText").focus();
    };

    // locationsFiltered
    // Computed observable array that contains a list of 
    // locations that match the current filter.
    // Filter searches for a match by checking the location name.
    self.locationsFiltered = ko.computed(function() {
      self.bounds = new gmaps.LatLngBounds();
      if(!self.filter()) {
        self.addAllMarkers();
        return self.locations(); 
      } else {
        return ko.utils.arrayFilter(self.locations(), function(location) {
          var name = location.name();
          var filter = self.filter();
          var isFilterTextMatchName;

          if (self.isFilterCaseSensitive()) {
            isFilterTextMatchName = (name.indexOf(filter) > -1);
          } else {
            isFilterTextMatchName = (name.toLowerCase().indexOf(filter.toLowerCase()) > -1);
          }

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
