jQPad.extend({
	/** Notify -- Give a small notification to the user
	 ** jQPad.notify( { message, time }, onclick, callback )
	 ** returns: jQPad
	 **/
	notify: function(data, onclick, callback) {
		//Set the vars
		var msg = !data.message ? data.msg : data.message, //Give the parameters some name vareity
		duration = !data.duration ? data.time : data.duration, //not very much though
		onclick = (typeof onclick == "function") ? onclick : function() { return 0; },
		callback = (typeof callback == "function") ? callback : function() { return 0; },
		dims = new jQPad.dims(),
		//Create the notification
		notification = $("<div class='notify'></div>").bind("click", onclick);
		
		notification.appendTo("body");
		notification.css({ "margin-top" : dims.windowHeight, "width" : dims.windowWidth });
		notification.html("<h1>" + msg + "</h1>").animate({marginTop: (dims.windowHeight  - notification.height()) }, 300, function() {
			var $this = $(this);
			jQPad.delay(function() {
				$this.animate({marginTop: dims.windowHeight }, 300, function(){
					$this.remove();
					callback();
				});
			}, duration);
		});
		return this;
	}
}).attachResource("/plugins/notify/notify.jqpad.css");