/**
 ** Developer Tools
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 **/

jQPad.extend({
	printObject: function(obj, type) {
		console.log(obj);
		switch( type ) {
			case "php":
			
			$.post("/plugins/developer/debug/printObj.php", {object: JSON.stringify(obj)}, function(data) {
				var printedObj = window.open('');
				printedObj.document.open();
				printedObj.document.write(data);
				printedObj.document.close();
			});
			
			case "consoleall":
			var output;
			for (property in obj) {
			  	output = property + ': ' + obj[property]+'; ';
				console.log(output);
			}
			
			default:
			console.log(obj);
		}
		return this;
	}
});