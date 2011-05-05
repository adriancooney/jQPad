/**
 ** Expandable menu items
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 ** 
 ** Add's expandable Menus to jQPad's Menu Bar
 ** Usage:
 ** expandableMenu assumes that the list to be expanded is directly below (or next to)
 ** the toggle, so ontap, tbe lisdt is toggled.
 **
 ** Specify the data-target attribute to be 'toggleMenu'
 **/

jQPad.extend({
	expandableMenu: {
		toggleMenu: function() {
			var host = $(this).parents("li"),
			elem = host.next(),
			status = host.data("toggleStatus");
	        if(status == "untoggled") {
	            elem.slideDown(300).prev().data("toggleStatus", "toggled");
	        }
	        if(status == "toggled") {
	            elem.slideUp(300).prev().data("toggleStatus", "toggled");
	        }
		},

		loopThroughLists: function() {
			$(".subList").each(function(i, v) {
				$(this).prev().data("toggleStatus", "toggled");
				jQPad.expandableMenu.toggleMenu.call($(this).prev().find("a"));
			});
		}
	}
}).attachResource("/plugins/expandableMenu/expandableMenu.jqpad.css");

jQPad.attachEvent({ 
	onload: jQPad.expandableMenu.loopThroughLists, 
	toggleMenu: jQPad.expandableMenu.toggleMenu 
	});