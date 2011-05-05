/**
 ** Geolocationing
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 **/

jQPad.extend({
	geolocation: {
		getLocation: function() {
			if(navigator.geolocation) {
				console.log("called");
				var location = {};
				navigator.geolocation.getCurrentPosition(function(pos) {
					var coords = pos.coords;
					location = {
						latitude: coords.latitude,
						longitude: coords.longitude,
						altitude: coords.altitude,
						accuracy: coords.accuracy,
						altitudeAccuracy: coords.altitudeAccuracy,
						heading: coords.heading,
						speed: coords.speed,
						timestamp: pos.timestamp
					};
					console.log(location);
				}, function() {
					location = false;
				});
				return location;
			} else {
				return false;
			}
		}
	}
});