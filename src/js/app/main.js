define([
  "app/globals",
  "jquery",
  "underscore",
  "knockout",
  "googlemaps",
  "app/viewmodel/Locations"
], function(c,$,_,ko,gmaps,Locations) {
  $(function() {
    "use strict";

    var locations = ko.utils.parseJson(window.localStorage.getItem(c.LOCAL_STORAGE_ITEM_KEY));
    ko.applyBindings(new Locations(locations || []));

    var map = new gmaps.Map(document.getElementById('map'), {
      center: {lat: 43.05, lng: -87.96},
      zoom: 8
    });

  });
});
