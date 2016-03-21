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

    self.bounds = new gmaps.LatLngBounds();

    self.locations = ko.observableArray(ko.utils.arrayMap(locations, function (location) {
      return new Location(location.name);
    }));

    self.filter = ko.observable("");

    self.isFilterCaseSensitive = ko.observable(false);

    self.activeLocation = null;

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

      self.geocoder.geocode({ address: name }, function(results, status) {
        if (status == gmaps.GeocoderStatus.OK) {

          var position = results[0].geometry.location;

          self.bounds.extend(position);

          var content = '<h2>' + name + '</h2>';

          marker = new gmaps.Marker({
            map: self.map,
            position: position,
            title: name,
            animation: gmaps.Animation.DROP
          });

          var infoWindow = new gmaps.InfoWindow({
            content: content
          });

          location.position = position;
          location.marker = marker;
          location.infoWindow = infoWindow;

          gmaps.event.addListener(marker, 'click', function() {
            self.setActiveLocation(location);
          });

          gmaps.event.addListener(infoWindow, 'closeclick', function() {
            self.setActiveLocation(null);
          });

          self.loadInfoWindowTextFromWikipedia(name, location.infoWindow);
          self.loadInfoWindowTextFromNewYorkTimes(name, location.infoWindow);
          self.loadInfoWindowImageFromGoogleMaps(name, location.infoWindow);

          self.map.fitBounds(self.bounds);

        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
    };

    self.loadInfoWindowImageFromGoogleMaps = function(searchText, infoWindow) {
      var width = 300;
      var height = 100;
      var streetviewUrl = "https://maps.googleapis.com/maps/api/streetview?size=" + width + "x" + height + "&location=" + searchText + "&heading=0&pitch=0";

      infoWindow.content += '<h3>Street View</h3>';
      infoWindow.content += '<img class="bgimg" src="' + streetviewUrl + '">'
    };

    self.loadInfoWindowTextFromWikipedia = function(searchText, infoWindow) {
      var wikiUrlAction = 'action=opensearch';
      var wikiUrlSearch = 'search=' + searchText;
      var wikiUrlFormat = 'format=json';
      var wikiUrl = 'https://en.wikipedia.org/w/api.php?' + wikiUrlAction + '&' + wikiUrlSearch + '&' + wikiUrlFormat;
      var wikiUrlErrorHandler = function(){
          console.log("Failed to get Wikipedia articles for " + searchText);
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

        if (titles.length > 0) {
          infoWindow.content += '<h3>Wikipedia</h3>';
          infoWindow.content += '<p>' + snippets[0] + '</p>' + '<p>' + web_urls[0] + '</p>';
        } else {
          console.log("No Wikipedia entry found for " + searchText);
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

    self.loadInfoWindowTextFromNewYorkTimes = function(searchText, infoWindow) {
      var nytUrlFilteredQuery = 'fq=type_of_material:("News") AND "' + searchText + '"';
      var nytUrlSortOrder = 'sort=newest';
      var nytUrlFields = 'fl=headline,pub_date,snippet,web_url';
      var nytUrlApiKey = 'api-key=9df2b415e47006caa7d29120aeec20f6:9:74652536';
      var nytUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?' + nytUrlFilteredQuery + '&' + nytUrlSortOrder + '&' + nytUrlFields + '&' + nytUrlApiKey;
      var nytUrlCallbackHandler = function(data) {

          if(!data) return;
          if(!data.response) return;
          if(!data.response.docs) return;

          if (data.response.docs.length > 0) {
            var article = data.response.docs[0];
            infoWindow.content += '<h3>New York Times</h3>';
            infoWindow.content += '<h4>' + article.headline.main + '</h4>';
            infoWindow.content += '<p>' + article.snippet + '</p>' + '<p>' + article.web_url + '</p>';
          } else {
            console.log("No NYT entry found for " + searchText);
          }
      };
      var nytUrlErrorHandler = function(){
          console.log("Failed to get New York Times articles for " + searchText);
      };

      // New York Times Request
      $.getJSON(nytUrl,nytUrlCallbackHandler).fail(nytUrlErrorHandler);
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
      if (self.activeLocation && self.activeLocation.infoWindow) {
        self.activeLocation.marker.setIcon("");
        self.activeLocation.marker.setAnimation(null);
        self.activeLocation.infoWindow.close();
      }

      if (location && location.infoWindow) {
        location.infoWindow.open(self.map, location.marker);
        self.activeLocation = location;
        // Google Map Icons
        // http://stackoverflow.com/questions/17746740/google-map-icons-with-visualrefresh
        self.activeLocation.marker.setIcon("http://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2");
        self.activeLocation.marker.setAnimation(gmaps.Animation.BOUNCE);
      }
    };

    self.remove = function(location) {
      self.removeMarker(location);
      self.locations.remove(location);
    };

    self.removeMarker = function(location) {
      if(!location.marker) return;
      location.marker.setMap(null);
    };

    self.addAllMarkers = function() {
      ko.utils.arrayForEach(self.locations(), function(location) {
        self.addMarker(location);
      });
    };

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
