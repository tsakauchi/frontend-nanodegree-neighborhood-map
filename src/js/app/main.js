define([
  "app/globals",
  "jquery",
  "underscore",
  "knockout",
  "googlemaps",
  "app/viewmodel/Locations"
], function(c, $, _, ko, gmaps, Locations) {
  "use strict";

  var map = new gmaps.Map(document.getElementById('map'), {
    center: {lat: 43.05, lng: -87.96},
    zoom: 8
  });

  var locations = ko.utils.parseJson(window.localStorage.getItem(c.LOCAL_STORAGE_ITEM_KEY));

  var defaultLocations = [
    { name: "New Berlin, WI" },
    { name: "Racine, WI" },
    { name: "South Milwaukee, WI" },
    { name: "Madison, WI" },
    { name: "Milwaukee, WI" },
  ];

  if (!locations || locations.length < 1) locations = defaultLocations;

  ko.applyBindings(new Locations(locations, map));





});
