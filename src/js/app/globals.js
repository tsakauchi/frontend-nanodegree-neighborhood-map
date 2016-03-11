define([
  "app/config",
  "underscore"
], function(config,_) {
  "use strict";

  var globals = {
    ENTER_KEY: 13,
    ESCAPE_KEY: 27,
    LOCAL_STORAGE_ITEM_KEY: 'neighborhood-map'
  };

  _.extend(globals, config);
  return globals;
});
