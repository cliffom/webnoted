function WNDataStore(storageType) {
	this.storageType = storageType;
	
	this.setItem = function(itemName, itemValue) {
		this.storageType.setItem(itemName, itemValue);
	};
	
	this.getItem = function(itemName) {
		return this.storageType.getItem(itemName);
	};
	
	this.removeItem = function(itemName) {
		this.storageType.removeItem(itemName);
	};
	
	this.getLength = function() {
		return this.storageType.length;
	}
	
	this.getStorageType = function() {
		return this.storageType;
	}
}

function getQueryString() {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0; i<vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	} 
	return query_string;
}

function getNoteId() {
	var queryString = getQueryString();
	var locationArray = window.location.href.split('/');
	var noteId = (queryString.noteId !== undefined) ? queryString.noteId : locationArray[locationArray.length - 1];
	
	if (noteId === '' || noteId === 'index.html' || noteId === '#') {
		noteId = undefined;
	}
	
	return noteId;
}