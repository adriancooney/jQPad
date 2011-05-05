
$document.ready(function() {

	jQPad.onload();
	
	//var db = new Q.db({shortName: "cool"});
	//Q.db.fn.query(db, { query: "CREATE TABLE IF NOT EXISTS boo(id INTEGER);"});
	//Q.db.fn.query(db, { query: "INSERT INTO boo(id) VALUES(200)"});
	//Q.db.fn.query(db, { query: "SELECT * FROM boo"}, function(results) { console.log(results.rows.item(1)['id']); });
	//Q.db.fn.delTable(db, "boo");
	
	Q.ajax.fetch({ url:"/content/default/index.html"}, function(data) { 
		$(".content-right .content-main").html(data); 
	});
})



/**** Development ****/
function jqlog(string) {
	console.log(string);
};	


	/**** Database functionality ****/

jQPad.extend({
	db: {
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
			query: function(data, callback) {
				if(typeof data.data !== "array" || data.data == null || !data.data) dataArr = [];
				else dataArr = data.data;

				if(jQPad.db.fn.checkDB(db)) {
					//Open a transaction
					this.transaction(
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
				return this.db;
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
				return this.db;
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
				return this.db;
			},

			//Delete table from the database
			//jQPad.db.fn.deleteTable(name)
			delTable: function(db, table) {
				if(jQPad.db.fn.checkDB(db)) {
					jQPad.db.fn.query(db, {query: "DROP TABLE " + table + ";"});
				}
				return this.db;
			},
	}
});