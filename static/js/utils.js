/* Author: Renato Hotz
 */

var utils = (function() {
    "use strict";

    var getCookie = function(name) {

    };

    var setCookie = function(name, value, days) {
        var exp = new Date();

        exp.setDate(exp.getDate() + days);

        var c_value=escape(value) +
            ((exdays==null) ? "" : ("; expires="+exdate.toUTCString()));
        document.cookie=c_name + "=" + c_value;
    };

    return {
        setCookie: setCookie,
        getCookie: getCookie
    };
}());