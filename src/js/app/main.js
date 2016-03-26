define([
  "app/globals",
  "jquery",
  "underscore",
  "knockout",
  "googlemaps",
  "knockout-hotkeys",
  "app/viewmodel/Locations"
], function(c, $, _, ko, gmaps, hotkeys, Locations) {
  "use strict";

  var map = new gmaps.Map(document.getElementById('map'), {
    center: {lat: 43.05, lng: -87.96},
    zoom: 8
  });

  var locations = ko.utils.parseJson(window.localStorage.getItem(c.LOCAL_STORAGE_ITEM_KEY));

  var defaultLocations = [
    { name: "Lambeau Field" },
    { name: "Milwaukee Art Museum" },
    { name: "Milwaukee County Zoo" },
    { name: "University of Wisconsin, Green Bay" },
    { name: "1 Brewers Way, Milwaukee, WI 53214" },
  ];

  if (!locations || locations.length < 1) locations = defaultLocations;

  ko.applyBindings(new Locations(locations, map));

});
