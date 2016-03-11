define(["jquery","knockout","app/model/AppModel"], function($,ko,AppModel) {
  "use strict";
  $(function() {
    ko.applyBindings(new AppModel());
    //ko.applyBindings(new AppViewModel());
  });
});
