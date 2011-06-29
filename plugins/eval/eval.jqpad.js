jQPad.extend({
	eval: function(string) {
		window.eval(string);
	}
}).attachEvent("eval", jQPad.eval);