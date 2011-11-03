//iPhoneのセッション消え対策

function PCookie(){};
(function(Class){
	
	var DB_NAME = "Class";
	var DB_VER = "1.0";
	var DB_SIZE = 8192;
	var SQL_CREATE = "CREATE TABLE cookies (key TEXT PRIMARY KEY, value TEXT)";
	var SQL_DROP   = "DROP TABLE cookies";
	var SQL_SELECT = "SELECT * FROM cookies";
	var SQL_DELETE = "DELETE FROM cookies";
	var SQL_INSERT = "INSERT INTO cookies VALUES(?,?)";
	var SQL_UPDATE = "UPDATE cookies SET value=? WHERE key=?";
	Class.done = true;
	
	Class.names = {
		JSESSIONID:true
	};
	
	Class.setNames = function(names) {
		Class.names = names;
	}
	
	Class.save = function() {
		if (! window.openDatabase) return;
	
		var db = openDatabase(DB_NAME, DB_VER,DB_NAME,DB_SIZE);
		if (db == null) return;
		Class.done = false;
		db.transaction(function(tx){
			tx.executeSql(SQL_DELETE, [],
				Class.onInsert, Class.onInit);
		});
	}
	Class.clear = function(callback) {
		if (! window.openDatabase) return;
	
		if (callback === undefined) callback = Class.onNil;
		var db = openDatabase(DB_NAME, DB_VER,DB_NAME,DB_SIZE);
		if (db == null) return;
		Class.done = false;
		db.transaction(function(tx){
			tx.executeSql(SQL_DELETE, [],
				callback, Class.onInit);
		});
	}
	
	Class.onInsert = function(tx) {
		var cookies = Class.getCookies();
		for (var key in cookies) {
	        tx.executeSql(SQL_INSERT, [key, cookies[key]],
	        		Class.onNil, Class.onError); 
		}
		Class.done = true;
	}
	Class.onInit = function(tx,err) {
	    //alert(err.message);
	    tx.executeSql(SQL_CREATE, [],
	    		Class.onNil, Class.onError); 
	    Class.onInsert(tx);
	}
	
	Class.load = function() {
		if (! window.openDatabase) return;
			
		var db = openDatabase(DB_NAME, DB_VER,DB_NAME,DB_SIZE);
		if (db == null) return;
		Class.done = false;
		db.transaction(function(tx){
			tx.executeSql(SQL_SELECT, [],
				Class.onSelect, Class.onErrorLog);
		});
	}
	
	Class.onSelect = function(tx, rs) {
		var cookies = Class.getCookies();
		for (var i=0; i<rs.rows.length; i++) {
			var row = rs.rows.item(i);
			//console.log("===>"+row.key+"="+row.value);
			if (Class.names[row.key]) {
				//console.log("==-----=>"+row.key+"="+row.value);
				cookies[row.key] = row.value;
			}
		}
		Class.putCookies(cookies);
		Class.done = true;
	}
	Class.onError = function(tx, err) {
		Class.done = true;
	    alert(err.message);
	}
	Class.onErrorLog = function(tx, err) {
		Class.done = true;
	    console.log(err.message);
	}
	Class.onNil = function(tx, err) {
		Class.done = true;
	}
	
	
	Class.getCookies = function() {
		var cookies = {};
		var parts = document.cookie.split(";");
		for (var i=0; i<parts.length; i++) {
			var kv = parts[i].split("=");
			var k = kv[0].replace(/^[ ]*/,"");
			cookies[k] = kv[1];
		}
		return cookies;
	}
	
	Class.putCookies = function(cookies) {
		var str = "";
		for (var key in cookies) {
			str += ";"+key+"="+cookies[key];
		}
		if (str != "") {
			document.cookie = str.substr(1)
		}
	}
	
	Class.setMaxAge = function(name, age) {
		var cookies = Class.getCookies();
		if (! cookies[name]) return;
		
		var date = new Date();
		date.setTime(date.getTime() + age*1000);
		document.cookie = name + "=" + cookies[name] 
			+ ";expires=" + date.toGMTString();
	}

})(PCookie);
