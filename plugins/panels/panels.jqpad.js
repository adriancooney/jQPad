/**
 ** jQPad Social intergration
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 **/

jQPad.extend({
	panels: {
		/** Open Panel -- Open the designated panel
		 ** QPad.fn.openPanel( elem )
		 ** returns: jQPad
		 **/
		openPanel: function(action) {
			//Slide down the elem
			//I'm using the slideDown method because,
			//Whats the point recreating the enviorment i.e get the dimensions, viewport
			//to slide the element when I can do it 'natively'
			
			$($(this).data("panelToOpen")).slideDown(300, function() {
				//the close button
				var closeButton = $("<span class='close'>Close</span>");
				//Add a close button
				if(!$(this).find(".close").length) closeButton.live("click", function() { console.log("called"); jQPad.panels.closePanel.call(); }).prependTo(this);
				//Add the panel active class
				$(this).addClass("panel-active");
			});
			return this;
		},

		/** Close panel -- Close the designated panel
		 ** jQPad.panels.closePanel( elem )
		 ** returns: jQPad
		 **/
		closePanel: function(action) {
			console.log(arguments);
			$($(this).data("panelToClose")).slideUp(300, function() {
				$(this).removeClass("panel-active");
			});
			return this;
		},
		
		/** Hide Panels -- Hide the panels
		 ** jQPad.hidePanels()
		 ** returns: jQPad
		 **/
		hidePanels: function() {
			$(".panel").each(function() {
				$(this).slideUp(0);
			});
			return this;
		}
	}
}).attachEvent({
	"panel-open": jQPad.panels.openPanel,
	"panel-close": jQPad.panels.closePanel,
	onload: jQPad.panels.hidePanels
});