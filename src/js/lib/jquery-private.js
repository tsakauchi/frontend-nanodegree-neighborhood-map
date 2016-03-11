// jquery-private module used to hide access to jQuery via global namespace
// http://requirejs.org/docs/jquery.html
define(['jquery'], function (jq) {
    return jq.noConflict( true );
});
