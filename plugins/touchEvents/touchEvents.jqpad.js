/**
 ** Touch events
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 **/

jQPad.extend({
	touchEvents: function() {
		var $window = $(window);
		
		$.moveup = function(callback) {
			$window.bind("moveup", callback);
		};
		
		$.movedown = function(callback) {
			$window.bind("movedown", callback);
		};
		
		$.shake = function(callback) {
			$window.bind("shake", callback);
		};
		
		$.fn.swipe = function(callback) {
			
		}
	}
}).attachEvent({onload: jQPad.touchEvents});