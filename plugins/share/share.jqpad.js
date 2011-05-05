/**
 ** jQPad Social intergration
 ** by Adrian Cooney
 **
 ** Licensed under the MIT License:
 ** http://www.opensource.org/licenses/mit-license.php
 **/

jQPad.extend({
	shareMe: function() { 
		
		var $this = $(this),
		$body = $("body"),
		
		pos = $this.position(),
		elemWidth = $this.width(),
		elemHeight = $this.height(),
		
		//Positioning
		//Distance from left of the screen + half the width of the element
		posX = pos.left + (elemWidth/2),
		//Distance from top of the screen + the height of the element + a little sum' sum' (A small margin)
		posY = pos.top + elemHeight + 16,
		
		//The button is deceptively big, eh?
		button = '<div class="share-bubble-wrapper" style=" top:' + posY + 'px; left: ' + posX + 'px;"><div class="bubble-share">' +
				'<div class="top-arrow"></div><li><script src="http://widgets.digg.com/buttons.js" type="text/javascript"></script>' +
				'<a class="DiggThisButton DiggMedium"></a></li>' +
				'<li><a href="http://twitter.com/share" class="twitter-share-button" data-count="vertical">Tweet</a></li>' +
				'<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script><li>' +
				'<a name="fb_share" type="box_count" href="http://www.facebook.com/sharer.php">Share</a></li>' +
				'<script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div></div>';
		
		//Insert our button
        $this.after(button);

		//Bring it into view
	    $(".share-bubble-wrapper").animate({
	    	marginTop: 0,
	    	opacity: 1
	    }, 200);
            
		//And attach an event to close it
		$(window).bind("touchmove", closeShareBubble);
		
		function closeShareBubble() {
			console.log("called");	
			$body.find(".bubble-share").animate({ opacity: 0 }, 150, function() {
			    $(this).remove();
			    jQPad.location.empty();
			});
		}
		
    }
	}).attachResource("/plugins/share/share.jqpad.css").attachEvent("share", jQPad.shareMe);