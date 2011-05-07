/**
 ** Cookie functionality
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 **/

jQPad.extend({
	/** Set cookies -- Set a cookies value, if none, will create it
	 ** jQPad.createCookie( name, value )
	 ** returns: jQPad
	 **/
	setCookie: function(name, value) {
		document.cookie = name + "=" + value + ";expires=Thu, 2 Aug 2020 20:47:11 UTC; path=/";
		return this;
	},

	/** Get Cookie -- Returns the value of a cookie
	 ** jQPad.getCookie( name )
	 ** returns: jQPad
	 **/
	getCookie: function(name) {
		if(document.cookie.length > 0) {
			var cookie = document.cookie.indexOf(name + "=");
			 if(cookie !== -1) {
				cookie = cookie + name.length + 1;
				var val = document.cookie.indexOf(";", cookie);
			
				if(val == -1) val = document.cookie.length;
				return unescape(document.cookie.substring(cookie, val));
			}
		} else {
			jQPad.error("Function: getCookie() -- There is no cookies :(");
		}
		return this;
	},

	/** Delete cookie -- Do exactly what it says
	 ** jQPad.delCookie( name )
	 ** returns: jQPad
	 **/
	delCookie: function(name) {
		if( Q.fn.getCookie( name ) ) {
			document.cookie = name + "=;expires=Thu, 25-Dec-2000 00:00:01 GMT"; //Merry Christmas!
		} else {
			jQPad.error("Function: delCookie() -- Can't find cookie");
		}
		return this;
	}
});