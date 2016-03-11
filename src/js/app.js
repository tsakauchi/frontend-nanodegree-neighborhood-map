// configure requirejs, then...
requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
      "app": "../app"
    },

    // [[ noconflict to prevent jQuery access via global namespace ]]
    //
    // If all of your modules (including any third party jQuery plugins 
    // or library code that depend on jQuery) are AMD compatible and you 
    // want to avoid having $ or jQuery in the global namespace when they 
    // call requirejs(['jquery']), you can use the map config to map the 
    // use of jQuery to a module that calls noConflict and returns that 
    // value of jQuery for the 'jquery' module ID.
    //
    // src: http://requirejs.org/docs/jquery.html
    map: {
      // '*' means all modules will get 'jquery-private'
      // for their 'jquery' dependency.
      '*': { 'jquery': 'jquery-private' },
      // 'jquery-private' wants the real jQuery module
      // though. If this line was not here, there would
      // be an unresolvable cyclic dependency.
      'jquery-private': { 'jquery': 'jquery' }
    }
});

// ...load the main app module to start the app
requirejs(["app/main"]);
