/**
 ** 
 ** jQPad iPad web framework
 ** http://github.com/AdrianCooney/jQPad
 ** Copyright 2011, Adrian Cooney
 **
 ** Includes iScroll
 ** http://cubiq.org/iscroll
 ** Copyright 2011, Matteo Spinelli
 ** Released under the MIT, BSD, and GPL Licenses.
 **
 ** Date: 15/5/11
 ** 
 ** TODO:
 ** -Implement functional backbutton
 ** -Finish Pages API
 ** -Finish animations
 ** 
 **/

var jQ = jQPad = {};
jQPad.errorLog = [];
jQPad.events = {
	onload: []
};
jQPad.pluginsLoaded = false;
jQPad.store = {};


/** Extend -- Extend the jQPad (or other) object
 ** jQPad.extend( object[to be inserted into host] [, object[host]] )
 ** returns: jQPad
 **/
jQPad.extend = function( obj, host) {
	//If no other variable is specified
	//Insert into this or jQPad
	if ( !host ) { 
		host = obj; 
		obj = this; 
	}
	
	//Actually insert
	for ( var i in host ) {
		obj[i] = host[i];
	}
	
	return this;
};

/**** Core Functions ****/
jQPad.extend({
	
	//Onload -- Fix/add/change things onload, basically setting things up.
	//You shouldn't be calling this. No, my friend, just leave it alone.
	onload: function() {
		
		//Onload prequisites
		//Resize the body on load
		jQPad.resizeBody();
		
		//Get the themes 'theme.js' if it exists
		jQPad.getThemeJS();
		
		jQPad.pages.createNewPage("Hello World!");
		
		//Handle direct linking to the site
		if(jQPad.location.get(true) == "") {
			//Load the default Page
			jQPad.fetch({url: "content/default/", isElsewhere: true});
		} else {
			jQPad.fetch({url: jQPad.location.get(true) });
		}

		/** Our main event, a click on the <a> or link
		 ** Set up a switch, do what it wants us to do
		 ** Types:
		 ** 	data-action
		 ** 	data-query
		 **  	href
		 **/
		$("a").live("click", jQPad.handleClick);
		
		//Because were not pro-anchor
		//Trigger the click event when a list item is clicked
		$(".nav li").live("click", function(e) {
			jQPad.handleClick.call($(this).find("a"), e);
		});
			
		//Change the title
		jQPad.toolbar.changeSubTitle(jQPad.meta("site-name"));
		
		//Start logging history
		jQPad.history.startLogging();
		
		//Resize the body on orientation change
		//Bind the Orientation change event
		$(window).bind("orientationchange", jQPad.resizeBody);
		
		//iScroll Funcionality
		//http://cubiq.org/iscroll
		//Thank you, Matteo Spinelli
		//Seriously, thank you.
        $(document).live('touchmove', function(event) {
			//Prevent the default touchmove functionality
            event.preventDefault();
        });
		//More annoying space that was visible if you pulled the toolbar
		$(".toolbar").bind("touchmove", function(e) { e.preventDefault(); });
		
		//New iScroll's
		//The windows scrolling ability
        jQPad.delay(function() { new iScroll('scrollableleft'), new iScroll('scrollableright'); }, 10);

		//Some bug fixes 
		//Content was falling below window, need some propping up
		$(".content-right .content-main").append("<div class='space'></div>");
		
		//Lastly, after all is loaded, Call our plugin enviornment Onload event
		$(window).bind("pluginsLoaded", function() {
			if(jQPad.events["onload"].length > 0) {
				$.each(jQPad.events["onload"], function(i, functions) {
					try{
						functions.call(jQPad);
					} catch(e) {
						jQPad.error("Trying to execute Plugin Onload functions -- " + e.description);
					}
				});
			}
		});
		
		$(window).bind("hashchange", function(from, to){
			
		});
	},

	/** setVar -- Set a variable into a cache
	 ** jQPad.setVar( data[object] )
	 ** returns: jQPad
	 **/
	setVar: function(obj) {
		var host = jQPad.store;
	
		//Actually insert
		for ( var i in host ) {
			obj[i] = host[i];
		}
		return this;
	},
	
	/** Add Events -- Add events for onclick
	 ** jQPad.attachEvent( name[string], callback ) or ( object[eventName : functionToCall])
	 ** returns: jQPad
	 **/
	attachEvent: function(name, callback) {
		
		this.makeArray = function(variable) {
			var cache = variable;
			variable = [];
			variable.push(cache);
		};
		
		if(typeof name == "object") {
			//Loop through the object
			for(var i in name) {
				//Just push to the onload object if it is onload, of course
				if(i == "onload") { jQPad.events["onload"].push(name[i]); }
					else {
					//Check if the event already exists
					//If it does, turn it into an array, then execute
					if(name[i] in jQPad.events) {
						//Check if the event is an object
						if(jQPad.events[i] == "object") {
							//Push to the event 
							jQPad.events[i].push(name[i]);
						} else {
							//Turn it into array, the push to it
							this.makeArray(jQPad.events[i]);
							jQPad.events[i].push(name[i]);
						}
					} else {
						//Oh, its a new event, create it then set it
						jQPad.events[i] = name[i];
					}
				}
			}
		} else {
			//String format
			//Check if its onload, if so push to it
			if(name == "onload") { jQPad.events["onload"].push(callback);}
			else {
				//Check if it already exists
				if(name in jQPad.events) {
					//Check if its an object
					if(jQPad.events[name] == "object") {
						//Great, its already an object, simply push to it
						jQPad.events[name].push(callback);
					} else {
					try {
						//Turn it into and array
						this.makeArray(jQPad.events[i]);
						//Push into it
						jQPad.events[name].push(callback);
					} catch(e) {
						jQPad.error("Function: attachEvent() -- Error adding event '" + e.description + "'");
					}
					}
				} else {
					//Oh, its a new event, create it then set it
					jQPad.events[name] = callback;
				}
			}
		}
		return this;
	},
	
	/** Attach Resource -- Add extras to plugins so user does not have to manually include
	 ** jQPad.attachResource( data[object || string(must only be one src)])
	 ** returns: jQPad
	 **/
	attachResource: function(data) {
		
		if(typeof data == "string") {
			var file = data;
			data = data.split(".")
			var filetype = data[data.length-1];
			data = {};
			data[filetype] = file;
		}
		
		var placeholder = {
			css: "<link rel=\"stylesheet\" type=\"text/css\" href=\"%URL%\" />",
			js: "<script src=\"%URL%\" type=\"text/javascript\"></script>"
		}, replacement = "%URL%";
		
		for( var i in data) {
			if(i in placeholder) {
				$("head").append(placeholder[i].replace(replacement, data[i]));
			}
		}
		return this;
	},

	/** Get Plugins -- Get plugins
	 ** jQPad.getPlugin( src[arrayOfURLs || string(must only be one src)])
	 ** returns: jQPad
	 **/
	getPlugin: function(data) {
		var loaded = 0, scriptsAmount = 0;
		if(typeof data == "string") {
			scriptsAmount = 1;
			getScript(data);
		}
		
		if(typeof data == "object") {
			scriptsAmount = data.length;
			$.each(data, function(i, v) {
				getScript(v);
			});
		}
		
		function getScript(src) {
			$.ajax({
				url: src,
				dataType: 'script',
				success: function() {
					loaded++;
					checkStatus();
				},
				error: function(e) {
					jQPad.error("Function: getPlugin() -- Cannot find plugin '" + src +"'");
				}
			});
		}
		
		function checkStatus() {
			if(scriptsAmount === loaded) { jQPad.pluginsLoaded = true; $(window).trigger("pluginsLoaded"); }
			else { jQPad.pluginsLoaded = false; }
		}
		
		return this;
	},
	
	/** Get Themes script [theme.js]
	 ** jQPad.getThemeJS( ) [internal function]
	 ** returns: jQPad
	 **/
	getThemeJS: function() {
		//Get the url for the theme
		var themePath = $("link[href^=themes]").eq(1).attr("href"),
		themePathSplit = themePath.split("/"),
		themePathStyle = themePathSplit[themePathSplit.length-1],
		themePath = themePath.replace(themePathStyle,""),
		themeFileName = "theme.js";
		
		//Get it if it exists
		$.ajax({
			url: themePath + "theme.js",
			dataType: 'script'
		});
		
	},
	
	/** Parse Meta Data -- Get site info from meta data
	 ** jQPad.meta( name, attr[optional] )
	 ** returns: Meta tag content [string]
	 **/
	meta: function(name, attr) {
		var $meta = $("meta[name="+name+"]");
		if($meta.length > 0) {
			if(!attr) {
				return $meta.attr("content");
			} else {
				return $meta.attr(attr);
			}
		} else {
			jQPad.error("Function: meta() -- Cannot find meta tag with name '" + name + "'");
		}
		return this;
	},
	
	/** Error -- Log an error and return it
	 ** jQPad.error( string )
	 ** returns: jQPad
	 **/
	error: function(string) {
		console.log("jQPad Error [ " + string + " ]");
		jQPad.errorLog.push(string);
		return this;
	},
	
	/** Error Log -- Simply outputs the error log (or error var)
	 ** jQPad.errorLog()
	 ** returns: jQPad
	 **/
	errorlog: function() {
		console.log(jQPad.errorLog);
		return this;
	},
	
	/** Loading -- Display or hide the loading, true == show, false == hide
	 ** jQPad.loading( [true || false] )
	 ** returns: jQPad
	 **/
	loading: function(bool) {
		var $loading = $(".loading");
		if (bool === true) {
		    $loading.css({
			"display": "block"
		    });
		} else {
		    $loading.css({
			"display": "none"
		    });
		}
		return this;
	},
	
	/** Delay -- Just setTimeout but changed to delay
	 ** jQPad.delay( callback, delay )
	 ** returns: jQPad
	 **/
	delay: function(callback, delay) {
		if(typeof callback == "function") {
			setTimeout(callback, delay);
		} else {
			jQPad.error("Function: Delay() -- Parameter Not a function");
		}
		return this;
	},
	
	/** Hash Change -- Manages hash change
	 ** jQPad.hashchange()
	 ** returns: null
	 **/
	hashchange: function() {
		//getting out location api
		var api = jQPad.location,
		history = jQPad.history.log.hashchange;
		//If the document hasn't already changed it
		if(history.length > 0) {
			if(history[history.length-1] == api.get()) {
				
			} else {
				logChange(api.get());
			}
		} else {
			logChange(api.get())
		}
		
		function logChange(log) {
			jQPad.history.log.hashchange.push(log);
			$(window).trigger("hashchange");
		}
	},

	/** Handle Click -- Handle the click event
	 ** jQPad.handleClick( elem )
	 ** returns: null
	 **/
	handleClick: function(e) {

		//Get some data
		var $this = $(this),
		//the data-target attribute
		dataAction = $this.data('action'),
		//The data-query attribute
		dataQuery = $this.data('query'),
		//The href Attribute
		dataHref = $this.attr('href').replace("#", ""),
		//Manipulating the Variables
		//Just check the Data-target
		dataAction = dataAction ? dataAction : false,
		//Just check the Data-Query
		dataQuery = dataQuery ? dataQuery : false;

		//This is where we control our linkage
		//First we check if there is a data-target attr
		//data-target is priority

		if( dataAction ) {
			if(dataAction in jQPad.events) {
				if(typeof jQPad.events[dataAction] == "object") {
					$.each(jQPad.events[dataAction], function(i, v) {
						v.call(this, dataAction);
					});
				} else {
					jQPad.events[dataAction].call(this, dataAction);
				}
			}
		} else {
			//Finally, an AJAX call!
			jQPad.fetch({url: dataHref, data: dataQuery, originates: $(this)});
		}
	},
	
	/** Check the element -- Parse a supposed element param
	 ** jQPad.getElem( elem )
	 ** returns: element [object]
	 **/
	checkElem: function(elem) {
		//Is the elem is a string
		if(typeof elem == "string") {
			//ternary operator save a bunch of if's
			//So its, if the element as a class is in the body, return it as a class, else
			//if the element as a id is in the body, return it as an id else
			//return null
			elem = elem.split(".").length > 1 ? $(elem) : 
			elem.split("#").length > 1 ? $(elem) :
			$("." + elem).length > 0 ? $("." + elem) : 
			elem = $("#" + elem).length > 0 ? $("#" + elem) : null;
		}
		//Is the elem is an object
		if(typeof elem == "object") {
			elem = elem.length > 0 ? elem : null;
		}
		
		return elem;
	},
	
	/**** AJAX ****/ 
	
	/** Fetch -- An AJAX call to get content
	 ** jQPad.fetch({ url, data, dataType, type["POST" or "GET"] }, callback(data){ //Do Stuff with data })
	 ** returns: jQPad
	 **/
	fetch: function(data, callback, position) {
		//Set defaults if empty
		//Ugh, wall of variables
		var url = !data.isElsewhere ? "content/" + data.url : data.url,
		insertInto = !data.insertInto ? ".content-right .content-main" : data.insertInto,
		query = data.data ? data.data : "",
		dataType = data.dataType ? data.dataType : "html",
		type = data.type ? data.type : "GET",
		transition = (data.transition) ? data.transition : "slideLeft",
		override = (data.overrideInsertion) ? data.overrideInsertion : false,
		originates = (data.originates) ? data.originates : window,

		onFetchSuccess = function(data) {
			
			console.log(jQPad.history.log.position);
			
			//Push to our request history
			jQPad.history.log.requests.push(url);
			
			if( callback ) { 
				//Someone wants to override the animation
				//Cheeky.
				callback.call(this, data) 
			} else {
				//TODO: Add position
				if(jQPad.history.log.position > 0) {
					jQPad.animations.slideX.slideLeft(data);
				} else {
					$(".content-right .content-main:eq(0)").empty().append(data);
				}
			}	
		};
		
		//The most basic of parameters,
		//Bud if you don't have this, you ain't goin' no-where
		if( data.url ) {
			
			//The actual AJAX call
			$.ajax({
				url: url,
				data: query,
				dataType: dataType, 
				type: type,
				success: onFetchSuccess,
				error: function(obj, status, text) {
					// :'(
					jQPad.error("Function: fetch() -- " + status + " | " + text + " -- Trying to retrive: " + url);
				}
			});
			
		} else {
			//Derp
			jQPad.error("Function: fetch() -- Forgot the URL");
		}
		
		return this;
	},
	
	/** Resize the body
	 ** jQPad.resizeBody()
	 ** returns: jQPad
	 **/
	resizeBody: function() {
		var dims = new jQPad.dimensions();
		//Resize the Document
		//For some reason, my variables with elements set won't work with these
        $(".content-left").css({
            "width": dims.leftColumn,
            "height": dims.windowHeight
        })	
		.find(".scroll-wrapper").css({
	        "width": dims.leftColumn,
	        "height": dims.windowHeight
	    });

        $(".content-right").css({
            "width": dims.rightColumn
        })
		.find(".scroll-wrapper,").css({
		    "width": dims.rightColumn,
		    "height": dims.windowHeight
		 });

        $(".content-right .content-main").add(".content-left .content-main").css({
            "min-height": dims.contentHeight
        });
		
		return this;
	},	
		
	/** Append Content -- Appends content to the current page
	 ** jQPad.appendContent( content[string] )
	 ** returns: jQPad
	 **/
	appendContent: function(content) {
		//Set default the placeholder
		var placeholder = $(".content-right .scroll-wrapper");
		
		if(content) {
			placeholder.find(".content-main:last").empty().append(content);
		} else {
			jQPad.error("Function: appendContent -- You forgot to specify content to add");
		}
	},
	
	/** Browser -- Returns the type of mobile browser
	 ** jQPad.browser();
	 ** returns: string["ipad" || "ipod" || "iphone" || "android"]
	 **/
	browser: function() {
		//Simple regex
		var regex = {
			android: /Android/i, 
			iphone: /iPhone/i, 
			ipod: /iPod/i,
			ipad: /iPad/i 
		};
		
		//Match the browser string to the regex
		for(var i in regex) {
			if(navigator.userAgent.match(regex[i])) return i;
			else return "unknown";
		}
	},

	/** Dimensions -- jQPad's viewport's dimensions
	 ** new jQPad.dimensions();
	 ** returns: object (below, basically)
	 **/
	dimensions: function() {
		//Cache the elements
 		var $window = $(window),
 		$document = $(document),

		dimensions = {
			windowHeight: $window.height(),
			windowWidth: $window.width(),
			//Defines the width of the left column (1 third of the screen)
			leftColumn: $window.width() / 3,
			//Defines the width of the right columm (Window width - 1 third of the screen(the left column) - 1 (Because it gets all fussy))
			rightColumn: $window.width() - ($window.width() / 3) - 1,
			//Height of the main content
			contentHeight: $window.height() - $(".toolbar").height()
		}
		return dimensions;
	},
	
	/**** API ****/
	
	/** Location -- API for the URL bar or location
	 ** Methods: change, append, prepend, remove, replace, empty
	 **/
	location: {
		/** Location.change -- Change the hash location
		 ** jQPad.location.change( string );
		 ** returns: jQPad
		 **/
		change: function(string) {
			window.location.hash = encodeURIComponent(string);
			return jQPad;
		},

		/** Location.append -- Appends a string to the current hash location
		 ** jQPad.location.append( string );
		 ** returns: jQPad
		 **/
		append: function(string) {
			jQPad.location.change(window.location.hash.replace("#", "") + string);
			return jQPad;
		},

		/** Location.append -- Prepends a string to the current hash location
		 ** jQPad.location.prepend( string );
		 ** returns: jQPad
		 **/
		prepend: function(string) {
			jQPad.location.change(string + window.location.hash.replace("#", ""));
			return jQPad;
		},

		/** Location.remove -- Remove a string from the current hash location
		 ** jQPad.location.remove( string );
		 ** returns: jQPad
		 **/
		remove: function(string) {
			jQPad.location.change(window.location.hash.replace(string, ""));
			return jQPad;
		},

		/** Location.replace -- Replace a certain string with another from the current hash location
		 ** jQPad.location.replace( string[to be replaced], string[to be replaced with] );
		 ** returns: jQPad
		 **/
		replace: function(from, to) {
			jQPad.location.change(window.location.hash.replace(from, to));
			return jQPad;
		},
		
		/** Location.empty -- empty the current hash location
		 ** jQPad.location.empty();
		 ** returns: jQPad
		 **/
		empty: function() {
			jQPad.location.change("");
			return jQPad;
		},
		
		/** Location.get -- returns the current location hash
		 ** jQPad.location.get([bool]);
		 ** returns: window.location.hash
		 **/		
		get: function(bool) {
			var location = window.location.hash;
			
			//If url is just wanted
			if(bool) {
				location = location.replace("#", "");
			}
			
			return location;
		}
	},
	
	/** Toolbar -- API for manipulation of the toolbar headings
	 ** Methods: changeTitle, changeMainTitle, changeSubTitle
	 **/
	toolbar: {
		/** Change Title -- Change the title
		 ** jQPad.toolbar.changeTitle( type["main" or "sub"], string )
		 ** returns: jQPad
		 **/
		changeTitle: function(type, string) {
			if( type ) {
				switch(type) {
					case "main":
						//Change main Title
						jQPad.changeMainTitle(string);
						break;
					case "sub":
						//Change sub title
						jQPad.changeMainTitle(string);
						break;
					}
			}
			return this;
		},
	
		/** Change Main Title -- Change the main title only
		 ** jQPad.toolbar.changeMainTitle( string )
		 ** returns: jQPad
		 **/
		changeMainTitle: function(string) {
			$(".content-right .toolbar h1").text(string);
			return this;
		},
	
		/** Change Sub Title -- Change the sub title only
		 ** jQPad.toolbar.changeSubTitle( string )
		 ** returns: jQPad
		 **/
		changeSubTitle: function(string) {
			$(".content-left .toolbar h1 a").text(string);
			return this;
		},

		/** Change Sub Title -- Change the sub title only
		 ** jQPad.toolbar.addButton( data[custom, title, side, float] )
		 ** returns: jQPad
		 **/
		addButton: function(data) {
			//Fix the conditions
			var side = data.side ? data.side : "right",
			alignment = data.float ? data.float : "right",
			title = data.title ? data.title : "Submit",
			button = data.custom ? data.custom : $("<button class='button " + alignment + "'>" + title + "</button>"),
			
			//Get the side;
			$toolbar = $(".content-" + side + " .toolbar");
			//Aaaaand append the button
			button.appendTo($toolbar);
		}
	},

	/** Pages -- Pages API
	 ** Methods: create, delete
	 **/
	pages: {	
	
		/** Create a new page -- inserts a new page after the current one
		 ** jQPad.createNewPage( )
		 ** returns: jQPad
		 **/
		create: function(content) {
			//Set default the placeholder
			var placeholder = $(".content-right .scroll-wrapper"),
			//The content to be inserted after the animation
			content = content ? content : "";
		
			// placeholder.find(".content-main").each(function() {
			// 	$(this).data("level", $(this).index());
			// });
		
			placeholder.find(".content-main:last").after("<div class=\"content-main\" data-level=\"" + (placeholder.find(".content-main").length + 1) + "\">" + content + "</div>");
		
			return this;
		},	
	
		/** Create a new page -- inserts a new page after the current one
		 ** jQPad.createNewPage( )
		 ** returns: jQPad
		 **/
		delete:function() {
			
		}
	},
	
	/** Database -- WebSQL/local databases API
	 ** Methods: checkDB, createDatabase, query, add, addTable, delTable, select
	 **/
	db: {
		
		/* Create the information variable */
		info: {
			name: "",
			tables: [],
			size: 0,
			version: 0,
			longname: ""
		},
		
		/** Check a Database -- Users may want to utilize an existing database [not yet implemented]
		 ** jQPad.db.checkDB( db )
		 ** returns: true or false [boolean]
		 **/
		checkDB: function(db) {
			//If the object has a version,
			//I think we can safely assume that somebody won't be passing
			//an object that has a version property,
			//But users are users and I need to find a more accurate method
			if(db.version) {
				return true;
			} else {
				return false;
			}
		},

		/** Create database -- Does exactly what it says
		 ** jQPad.db.createDatabase( {shortName [, version, displayName, mazSize]}[object]) || jQPad.db.createDatabase(shortname[string] )
		 ** returns: database [object]
		 **/
		createDatabase: function( data ) {
			var shortname, version, displayname, maxsize;
			//Database info
			//Set the variables
			if(typeof data == "string") {
				shortname = data;
			}
			
			if(typeof data == "object") {
				shortname = data.shortName,
				version = data.version ? data.version : "1.0",
				displayname = data.displayName ? data.displayName : shortname,
				maxsize = data.maxSize ? data.maxSize : 100000;
				
			}
			
			shortname = shortname ? shortname : "jQPad_" + jQPad.meta("site-name"),
			version = version ? version : "1.0",
			displayname = displayname ? displayname : shortname,
			maxsize = maxsize ? maxsize : 100000,
			
			//Create the database
			db = openDatabase( shortname, version, displayname, maxsize ),
			
			object = {};
			
			for(i in jQPad.db) {
				if(i == "createDatabase" || i == "checkDB") continue;
				object[i] = jQPad.db[i];
			}
			
			//Add the database to the object
			object.db = db;
			
			//Update the info variable
			this.info.name = shortname;
			this.info.size = maxsize;
			this.info.version = version;
			this.info.longname = displayname;
			
			//Return the database and it's methods
			return object;

		},

		/** Query the database -- execute an SQL query
		 ** jQPad.db.query( query[, data[array], callback ] )
		 ** returns: jQPad Database API
		 **/
		query: function(data, callback) {
			var query = "", dataArr = [];
			
			if(typeof data == "string") {
				query = data;
			}
			if(typeof data == "object") {
				query = data.query;
				dataArr = data.data;
			}

			if(jQPad.db.checkDB(this.db)) {
				//Open a transaction
				this.db.transaction(
					function(transaction) {
						//Execute the sql query
						transaction.executeSql(query, dataArr, function(transaction, results) {
							if(callback) callback.call(this, results);
						});
					}
				);
			}
			return this;
		},

		/** Add data -- Add data to a table
		 ** jQPad.db.add( table, object[ColumnName: value] )
		 ** returns: jQPad Database API
		 **/
		add: function(table, data) {
			//Compile SQL query
			var queryNames = [],
			queryData = [];
			
			//Compile the query
			for(name in data) {
				//Push the column names
				queryNames.push(name);
				//Push to the values
				queryData.push((typeof data[name] == "number") ? data[name] : '"' + data[name] + '"');
			}
			
			this.query("INSERT INTO " + table + "(" + queryNames.join(", ") + ") VALUES(" + queryData.join(", ") + ");");
			return this;
		},

		/** Select -- Builds an object of the database, or table
		 ** TODO: Fix the duplicate code
		 ** jQPad.db.select([table Name])
		 ** returns: The built store
		 **/
		select: function(name) {
			//Scope, damn scope
			var that = this;
			//Create our store, and if already there, empty it
			this.store = {}
			store = {};
			
			if(name) {
				var currentTableStore = store;
			
				that.query("SELECT * FROM " + name + ";", function(results) {
					var results = results.rows;
				
					//Create the column store
					for(key in results.item(0)) {
						currentTableStore[key] = {};
					}
				
					for(var i =0; i < results.length; i++) {
						//Get the item
						var item = results.item(i),
						length = 0;
						for(key in item) {
							currentTableStore[key][i] = item[key];
							length++;
							if(i == results.length-1) currentTableStore[key].length = i;
						}
						currentTableStore.length = length;
					}
				});
				
				this.store[name] = store;
				
			} else {
				$.each(that.info.tables, function(i, v) {
					store[v] = {};
					var currentTableStore = store[v];
					
					that.query("SELECT * FROM " + v + ";", function(results) {
						var results = results.rows;
						
						//Create the column store
						for(key in results.item(0)) {
							currentTableStore[key] = {};
						}
						
						for(var i =0; i < results.length; i++) {
							//Get the item
							var item = results.item(i),
							length = 0;
							for(key in item) {
								currentTableStore[key][i] = item[key];
								length++;
								if(i == results.length-1) currentTableStore[key].length = i;
							}
							currentTableStore.length = length;
						}
					});
				});

				this.store = store;
			}
			return this.store;
		},

		/** Create a table -- create a table in the database
		 ** jQPad.db.createtable(tableName, columnDefinitions[object]{ columnName: definition })
		 ** returns: jQPad Database API
		 **/
		createTable: function(name, data) {
			var dataString;
			
			//Add to the info variable
			this.info.tables.push(name);
			
			//Compile the query
			if(data) {
				if(typeof data == "object") {
					dataString = "";
					for(key in data) {
						dataString += key + " " + data[key] + ",";
					}
					
					//Get rid of the trailing comma
					dataString = dataString.substr(0, dataString.length-1);
				}
				if(typeof data == "string") {
					dataString = data;
				}
			} else {
				return jQPad.error("Function: [databaseObject].createTable -- No table columns specified, table not created.");
			}
			
			//Query the database
			this.query("CREATE TABLE " + name + "(" + dataString + ");");
			return this;
		},

		/** Delete a table -- delete a table in the database
		 ** jQPad.db.deletetable(tableName, columnDefinitions[object]{ columnName: definition })
		 ** returns: jQPad Database API
		 **/
		deleteTable: function(table) {
			//Remove from the info variable
			var tables = this.info.tables,
			tempTablesStore = [];
			
			//Loop through the tables store
			//If its not the one to be removed, 
			//add to the temporary store, if it the one to be removed
			//Continue, when finished replace the tables store with the temporary one
			for(var i = 0; i<tables.length; i++) {
				if(tables[i] == table) {
					continue;
				} else {
					tempTablesStore.push(tables[i]);
				}
			}
			
			//Update the table store
			this.info.tables = tempTablesStore;
			
			//Query
			this.query("DROP TABLE " + table + ";");
			return this;
		},
	},

	/** History -- jQPad's ajax history
	 ** Methods: startLogging, stopLogging, printLog, clearLog
	 **/
	history: {
		log: {
			requests: [],
			hashchange: [],
			//Position, the position of the user in nested pages,
			//0 = ground level,
			//1 = 1st level
			//2 = 2nd level etc.
			position: 0,
			lastTransition: ""
		},
		
		/** Start Logging -- Start logging history
		 ** jQPad.history.startLogging( )
		 ** returns: jQPad
		 **/
		startLogging: function() {
			if(!jQPad.history.logger) {
				jQPad.history.logger = setInterval(jQPad.hashchange, 150);
			} else {
				jQPad.error("Function: startLogging() -- You're already logging history");
			}
			return jQPad;
		},

		/** Start Logging -- Start logging history
		 ** jQPad.history.startLogging( )
		 ** returns: jQPad
		 **/
		stopLogging: function() {
			if(jQPad.history.logger) {
				clearInterval(jQPad.history.logger);
			} else {
				jQPad.error("Function: stopLogging() -- You're not logging history");
			}
			return jQPad;
		},
		
		/** Print Log -- Prints the history log
		 ** jQPad.history.printLog( )
		 ** returns: log
		 **/
		printLog: function() {
			console.log(jQPad.history.log);
			return jQPad.history.log;
		},

		/** Clear Log -- Clears the history log
		 ** jQPad.history.clearLog( )
		 ** returns: jQPad
		 **/
		clearLog: function() {
			jQPad.history.log.requests = [];
			jQPad.history.log.hashchange = [];
			return jQPad;
		},
			
	},

	/** Animation -- jQPad's animation functionality
	 ** Methods: 
	 **/
	animations: {
		store: {
			transitions: ['slideLeft', 'slideRight', 'slideTop', 'slideBottom', 'flip', 'fadeOut', 'fadeIn'],
			types: ['flip', 'scale', 'fade', 'slide'],
			defaultDuration: 450,
			defaultTransition: 'slideX'
		},
		
		flip: function() {
			
		},
		
		scale: function() {
			
		},
		
		fade: function() {
			
		},

		slide: function(type, content, callback) {
			$(".content-right .content-main").slide(type, content)
		}
		
	},
	
});

//Let the magic happen.
$(document).ready(jQPad.onload);

/**
 ** How about, take next page since technically it is a transition,
 ** and if not let the user override with 'takeNextPage' = false;
 ** So, the transition, 
 ** 		get page, 
 **			Animate 
 ** 		*sigh*
 **/
/**
 ** jQPad Animations Public jQuery Functions 
 **
 ** Slide Animation
 ** $(element).slide( type ["top", "bottom", "left", "right"],
 **				 content [string]
 **				 onStart Function called when animation is started [function],
 **				 callback [function] )
 **
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
    //Call the animation
    that.animate(animation, jQPad.animations.store.defaultDuration, callback); 
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


/**
 ** Flip animation
 ** $(element).flip(content [string]
 **				 onStart Function called when animation is started [function],
 **				 callback [function] )
 **
 **/
$.fn.flip = function(content, onStart, callback) {

    var that = this,
    duration = jQPad.animations.store.defaultDuration;

	if(onStart) onStart.call();
    
	//Add the styles
    $("head").append("<style type=\"text/css\">" +
      ".back {" +
        "z-index: 2;" +
        "-webkit-transform: rotateY(180deg);" +
        "position: absolute;" +
		"width: inherit; height: inherit" +
      "}" +
      ".front {" +
        "z-index: 3;" +
        "position: absolute;" +
		"width: inherit; height: inherit" +
      "}" +
      ".flip {" +
        "-webkit-transform: rotateY(180deg);" +
        "-webkit-transition: -webkit-transform " + duration + "ms;" +
        "-webkit-transform-style: preserve-3d;" +
      "}</style>");
    
    //First wrap the container
    that.wrap("<div class=\"flip-animation-container\" />");
    //Then change its class
    that.addClass("front")
    //Then insert the content after
    .after("<div class=\"back\">" + content + "</div>");
    
    var mom = that.parent(), //Parent
    $front = mom.find(".front"), //Front
    $back = mom.find(".back"); //Back
    
    mom.css({
        height: that.parent().height(),
        width: that.parent().width()
    }).addClass("flip");
    
    setTimeout(function() {
        $front.css({
            "z-index" : 1
        });
    }, duration/2);

	setTimeout(callback, duration);
    
};

$.fn.unflip = function() {
	var $mom = this.parent();
	this.appendTo(this.parent().parent());
	this.removeClass("flip").addClass("flip");
	$mom.remove();
};

/**
 ** Cube animation
 ** $(element).flip(content [string]
 **				 onStart Function called when animation is started [function],
 **				 callback [function] )
 **
 **/
$.fn.cube = function(content, onStart, callback) {

    var that = this,
    duration = jQPad.animations.store.defaultDuration;

	if(onStart) onStart.call();
	
	
	
};