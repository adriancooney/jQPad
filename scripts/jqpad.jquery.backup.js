//Globals
var Q = jQPad = {};

(function(Q) {
var jQPad = function() {
	/**** Vars ****/
	var error = [],
	
	//Elements
	$window = $(window),
	$document = $(document);
	
	//Dimensions
	//Need to get fresh dimensions every time, so
	// var newDims = new jQPad.dims
	this.dims = function() {
		var dimensions = {
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
	};
	
	/**** Core Functions ****/
	this.fn = this.prototype = {
		
		//Onload -- Fix/add/change things onload, basically setting things up.
		//You shouldn't be calling this. No, my friend, just leave it alone.
		onload: function() {
			
			//Onload prequisites
			//Resize the body on load
			jQPad.fn.resizeBody();
			//Hide the panels
			jQPad.fn.hidePanels();
			//Load the default Page
			jQPad.fn.fetch({url: "content/default/", isElsewhere: true});
			//Change the title
			jQPad.fn.changeSubTitle(jQPad.fn.meta("site-name"));
			
			//Resize the body on orientation change
			//Bind the Orientation change event
			$(window).bind("orientationchange", function() {
				jQPad.fn.resizeBody();
			});
			
			//iScroll Funcionality
			//http://cubiq.org/iscroll
			//Thank you, Matteo Spinelli
	        $(document).live('touchmove', function(event) {
				//Prevent the default touchmove functionality
	                event.preventDefault();
	        });
			
			//New iScroll's
			//The windows scrolling ability
	        new iScroll('scrollableleft'), new iScroll('scrollableright');
	
			//Some bug fixes 
			//Content was falling below window, need some propping up
			$(".content-right .content-main").append("<div class='space'></div>");
			//More annoying space that was visible if you pulled the toolbar
			$(".toolbar").bind("touchmove", function(e) { e.preventDefault(); });
		},

		/** Parse Meta Data -- Get site info from meta data
		 ** jQPad.fn.meta( name, attr[optional] )
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
				jQPad.fn.error("Function: meta() -- Cannot find meta tag with name '" + name + "'");
			}
		},
		
		/** Error -- Log an error and return it
		 ** jQPad.fn.error( string )
		 ** returns: Error string [string]
		 **/
		error: function(string) {
			console.log("jQPad Error [ " + string + " ]");
			error.push(string);
			return string;
		},
		
		/** Error Log -- Simply outputs the error log (or error var)
		 ** jQPad.fn.errorLog()
		 ** returns: null
		 **/
		errorlog: function() {
			console.log(error);
			return this;
		},

		/** Set cookies -- Set a cookies value, if none, will create it
		 ** jQPad.fn.createCookie( name, value )
		 ** returns: null
		 **/
		setCookie: function(name, value) {
			document.cookie = name + "=" + value + ";expires=Thu, 2 Aug 2020 20:47:11 UTC; path=/";
		},
		
		/** Get Cookie -- Returns the value of a cookie
		 ** jQPad.fn.getCookie( name )
		 ** returns: null
		 **/
		getCookie: function(name) {
			if(document.cookie.length > 0) {
				var cookie = document.cookie.indexOf(name + "=");
				 if(cookie !== -1) {
					cookie = cookie + name.length + 1;
					var val = document.cookie.indexOf(";", cookie);
					
					if(val == -1) val = document.cookie.length;
					return unescape(document.cookie.substring(cookie, val));
				}
			} else {
				jQPad.fn.error("Function: getCookie() -- There is no cookies :(");
			}
		},
		
		/** Delete cookie -- Do exactly what it says
		 ** jQPad.fn.delCookie( name )
		 ** returns: null
		 **/
		delCookie: function(name) {
			if( Q.fn.getCookie( name ) ) {
				document.cookie = name + "=;expires=Thu, 25-Dec-2000 00:00:01 GMT"; //Merry Christmas!
			} else {
				jQPad.fn.error("Function: delCookie() -- Can't find cookie");
			}
		},
		
		/** Loading -- Display or hide the loading, true == show, false == hide
		 ** jQPad.fn.loading( [true || false] )
		 ** returns: null
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
		},
		
		/** Delay -- Just setTimeout but changed to delay
		 ** jQPad.fn.delay( callback, delay )
		 ** returns: null
		 **/
		delay: function(callback, delay) {
			if(typeof callback == "function") {
				setTimeout(callback, delay);
			} else {
				jQPad.fn.error("Function: Delay() -- Parameter Not a function");
			}
		},
		
		/** Check the element -- Parse a supposed element param
		 ** jQPad.fn.getElem( elem )
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
		 ** jQPad.fn.fetch({ url, data, dataType, type["POST" or "GET"] }, callback(data){ //Do Stuff with data })
		 ** returns: null
		 **/
		fetch: function(data, callback) {
			//Set defaults if empty
			var url = !data.isElsewhere ? "content/" + data.url : data.url,
			query = data.data ? data : "",
			dataType = data.dataType ? data.dataType : "html",
			type = data.type ? data.type : "GET";

			if( data.url ) {
				$.ajax({
					url: url,
					data: query,
					dataType: dataType,
					type: type,
					success: function( data ) {
						if(callback) { callback(data); }
						else {
							$(".content-right .content-main").html(data);
						}
					},
					error: function(obj, status, text) {
						jQPad.fn.error("Function: fetch() -- " + status + " -- " + text);
					}
				});
			} else {
				jQPad.fn.error("Function: fetch() -- Forgot the URL");
			}
		},
		
		/**** DOM Manipulation ****/
		
		/** Change Title -- Change the title
		 ** jQPad.fn.changeTitle( type["main" or "sub"], string )
		 ** returns: null
		 **/
		changeTitle: function(type, string) {
			if( type ) {
				switch(type) {
					case "main":
						//Change main Title
						jQPad.fn.changeMainTitle(string);
						break;
					case "sub":
						//Change sub title
						jQPad.fn.changeMainSub(string);
						break;
					}
			}
		},
		
		/** Change Main Title -- Change the main title only
		 ** jQPad.fn.changeMainTitle( string )
		 ** returns: null
		 **/
		changeMainTitle: function(string) {
			$(".content-right .toolbar h1").text(string);
			return this;
		},
		
		/** Change Sub Title -- Change the sub title only
		 ** QPad.fn.changeSubTitle( string )
		 ** returns: null
		 **/
		changeSubTitle: function(string) {
			$(".content-left .toolbar h1 a").text(string);
			return this;
		},
		
		/** Open Panel -- Open the designated panel
		 ** QPad.fn.openPanel( elem )
		 ** returns: null
		 **/
		openPanel: function(elem) {
			//Slide down the elem
			//I'm using the slideDown method because,
			//Whats the point recreating the enviorment i.e get the dimensions, viewport
			//to slide the element when I can do it 'natively'
			console.log(jQPad.fn.checkElem);
			jQPad.fn.checkElem(elem).slideDown(300, function() {
				//the close button
				var closeButton = $("<span class='close'>Close</span>");
				//Add a close button
				if(!$(this).find(".close").length) closeButton.live("click", jQPad.fn.closePanel(this)).prependTo(this);
				//Add the panel active class
				$(this).addClass("panel-active");
			});
		},
		
		/** Close panel -- Close the designated panel
		 ** jQPad.fn.closePanel( elem )
		 ** returns: null
		 **/
		closePanel: function(elem) {
			jQPad.fn.checkElem(elem).slideUp(300, function() {
				$(this).removeClass("panel-active");
			});
		},
		
		/** Refresh -- Refresh/update the functions
		 ** jQPad.fn.refresh() -- Nope, you leave this alone.
		 ** return: null
		 **/
		refresh: function() {
			
		},
		
		/**** Prequisites ****/
		
		/** Hide the panels
		 ** jQPad.fn.hidePanels()
		 ** returns: null
		 **/
		hidePanels: function() {
			$(".panel").each(function() {
				$(this).slideUp(0);
			});
		},
		
		/** Resize the body
		 ** jQPad.fn.resizeBody()
		 ** returns: null
		 **/
		resizeBody: function() {
			var dims = new jQPad.dims;
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
		},
		
		/**** Plugins/API ****/
		
		/** Notify -- Give a small notification to the user
		 ** notify( { message, time }, onclick, callback )
		 ** returns: null
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
				jQPad.fn.delay(function() {
 					$this.animate({marginTop: dims.windowHeight }, 300, function(){
 						$this.remove();
						callback();
 					});
 				}, duration);
			});
			
		}
	};

	/**** Animations ****/
	this.ani = {
		//Slide content
		//jQPad.fn.slide
		slideContent: function(dir) {
			
		}
	};
	
	/**** Database functionality ****/
	this.db = function( data ) {
		
		return jQPad.db.createDatabase( data );
		
	}
	
	this.db.prototype = {
			/** Check if the function database param is actually database
			 ** jQPad.db.fn.checkDB( db )
			 ** returns: true or false [boolean]
			 **/
			checkDB: function(db) {
				//Not very accurate, will update in future
				if(typeof db == "object") {
					return true;
				} else {
					return false;
				}
			},

			/** Create database -- Does exactly what it says
			 ** jQPad.db.fn.createDatabase({ shortName[required], version, displayName, mazSize })
			 ** returns: database [object]
			 **/
			createDatabase: function( data ) {
				//Database info
				var shortname = data.shortName,
				version = data.version ? data.version : "1.0",
				displayname = data.displayName ? data.displayName : shortname,
				maxsize = data.maxSize ? data.maxSize : 100000;

				//Create the database
				db = openDatabase( shortname, version, displayname, maxsize );
				return db;

			},

			/** Query The database -- execute a SQL query
			 ** jQPad.db.fn.query( db, { query, data[array]}, callback )
			 ** returns: true[if successful] or false [if error] [boolean]
			 **/
			query: function(db, data, callback) {
				if(typeof data.data !== "array" || data.data == null || !data.data) dataArr = [];
				else dataArr = data.data;

				if(jQPad.db.fn.checkDB(db)) {
					//Open a transaction
					db.transaction(
						function(transaction) {
							//Execute the sql query
							transaction.executeSql(data.query, dataArr, function(transaction, results) {
								if(typeof callback == "function") {
									callback(results);
								}
							});
						}
					);
				}
			},

			/** Add Data from a table
			 ** jQPad.db.fn.add(db, table, data)
			 ** data = { dbColumnName : value } ex: data = { foo : bar }
			 ** returns: true[if successful] or false [if error] [boolean]
			 **/
			add: function(db, table, data) {
				if(jQPad.db.fn.checkDB(db)) {	
					//Compile SQL query
					var queryNames = [],
					queryData = [],
					questionmark = []; //I know ..I know
					for(var name in data) {
						questionmark.push("?");
						queryNames.push(name);
						queryData.push(data[name]);
					}
					var query = "INSERT INTO " + table + "(" + queryNames.join(", ") + ") VALUES(" + queryData.join(", ") + ");";
				
					jQPad.db.fn.query(db, {query: query});
				}
			},

			//Remove Data
			//remove(table, data)
			//remove: function(db, table, data) {
			//},

			//Add Table to the database
			//jQPad.db.fn.addTable(name, [array of data])
			addTable: function(db, name, data) {
				if(jQPad.db.fn.checkDB(db)) {
					jQPad.db.fn.query(db, {query: "CREATE TABLE " + table + ";"});
				}
			},

			//Delete table from the database
			//jQPad.db.fn.deleteTable(name)
			delTable: function(db, table) {
				if(jQPad.db.fn.checkDB(db)) {
					jQPad.db.fn.query(db, {query: "DROP TABLE " + table + ";"});
				}
			},
	};

};

Q = jQPad = new jQPad();

$(document).ready( function(){
	
	//Our onload function
	jQPad.fn.onload();
	
	jQPad.fn.notify({message: "First Notification, baby!", duration: 3000}, function() { alert("You clicked the notification!"); }, function() { alert("The notification is gone!"); });
	
	//Our main event, a click on the <a> or link
	//Set up a switch, do what it wants us to do
	// Types:
	//		data-target
	//		data-query
	$("a").live("click", function(e) {
		
		//Get some data
		var $this = $(this),
		//the data-target attribute
		dataTarget = $this.data('target'),
		//The data-query attribute
		dataQuery = $this.data('query'),
		//The href Attribute
		dataLink = $this.attr('href'),
		//Manipulating the Variables
		//Split the target up by the '-'
		dataTarget = dataTarget ? (dataTarget.split('-').length > 0 ? dataTarget.split('-') : false) : false,
		//Just check the Data Query
		dataQuery = dataQuery ? dataQuery : false,
		//Remove the hash tag from the url
		dataLink = new String(dataLink.replace('#', ''));
		
		console.log(dataTarget);
		console.log(dataQuery);
		console.log(dataLink);
		
		//Data target switch
		if( dataTarget ) {
			//For extensibility 
			switch( dataTarget[0] ) {
				//Panel function
				case "panel":
					alert("called");
					jQPad.fn.openPanel(dataTarget[1]);
				break;
			}
		} else {
			//Href (link) switch
			switch( dataLink ) {
				//Share Bubble
				case "share":
					alert("awesome.");
				break;
				
				//If none, 
				default:
					//Finally, an AJAX call!
					jQPad.fn.fetch({url: dataLink, data: dataQuery});
			}
		}
	});
	
	//Because were not pro-anchor
	//Trigger the click event when a list item is clicked
	$(".nav li").live("click", function() {
		console.log($(this).find("a").text());
	});
	
	console.log(Q);
	var db = new Q.db({shortName: "cool"});
	Q.db.fn.query(db, { query: "CREATE TABLE IF NOT EXISTS boo(id INTEGER);"});
	Q.db.fn.query(db, { query: "INSERT INTO boo(id) VALUES(200)"});
	Q.db.fn.query(db, { query: "SELECT * FROM boo"}, function(results) { Q.fn.notify(results.rows.item(1)['id']); });
	//Q.db.fn.delTable(db, "boo");
	
	//Q.fn.fetch({ url:"/content/default/index.html"}, function(data) { 
	//	$(".content-right .content-main").html(data); 
	//});
	
});
	
})(jQPad);