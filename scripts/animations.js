/**
 ** jQPad Animations
 ** Public  jQuery functions
 **/
 
$.fn.slide = function(type, content, onStart, callback) {
    var that = this,
    dimensions = {
        height: that.height(),
        width: that.width()
    },
    
    cases = {
        bottom: [dimensions.height, "Top"],
        top: [dimensions.height*-1, "Top"],
        left: [dimensions.width*-1, "Left"],
        right: [dimensions.width, "Left"]
    },
    
    //All it does is slide it's width completely to the left
    animation = {};
    
    animation["margin" + cases[type][1]] = cases[type][0];
    
	for(var i in animation) {
		console.log(i + " : " + animation[i]);
	}
    
    //Call the animation
    that.animate(animation, /*jQPad.animations.store.defaultDuration*/400, callback); 
};


$.fn.slideLeft = function(content, onStart, callback) {
	this.slide("left", content, onStart, callback);
};
$.fn.slideRight = function(content, onStart, callback) {
	this.slide("right", content, onStart, callback);
};
$.fn.slideTop = function(content, onStart, callback) {
	this.slide("top", content, onStart, callback);
};
$.fn.slideBottom = function(content, onStart, callback) {
	this.slide("bottom", content, onStart, callback);
};