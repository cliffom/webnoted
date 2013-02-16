$(function() {
	var webNoted = $("#webpad");
	var counterElement = $("#char-count span");
	var historyElement = $("#history");
	var dataStore = new WNDataStore(localStorage);
	var shareDialogElement = $("#share-message");
	var noteId = "<?php echo $noteId ?>";

	shareDialogElement.dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		draggable: false
	});

	webNoted
		.webNoted({
			"apiURL": "http://api.webnoted.com/",
			"dataStore": dataStore,
			"noteId": noteId
		})
		.on('resizeWebNoted', function() {
			$(this).height($(document).height() - 88);
		})
		.on('shareLinkGenerated', function() {
			var url ="http://www.webnoted.com/" + webNoted.webNoted('getSharedHash');
			var shared = shareDialogElement.find("input");
			shared.val(url).focus(function() { this.select(); });
			shareDialogElement.dialog("open");
			shared.attr("readonly", true);
		})
		.on('contentChanged', function() {
			setTimeout(function () {
				counterElement.html(webNoted.webNoted('count'));
			}, 0);
		})
		.on('noteCreated', function() {
			var documentName = webNoted.webNoted('getCurrentDocument');
			historyElement.append('<option value="' + documentName + '" selected="selected">' + documentName + '</option>');
		})
		.trigger('resizeWebNoted')
		.trigger('contentChanged')
	;

	$.each(webNoted.webNoted('getSavedNotes'), function(key, value) {
		var currentDocument = webNoted.webNoted('getCurrentDocument');
		historyElement.append('<option value="' + value + '">' + value + '</option>');
		if (currentDocument === value) {
			historyElement.val(value).attr('selected', true);
		}
	});
	historyElement.on("change", function() {
		webNoted.webNoted('switchDocument', $(this).val());
	});

	$("#sidebar .jsManageContents").click(function() {
		var e = $(this);
		var status = $("#status-message");
		var statusText = '';
		var action = e.attr('id');
		var timeout = 1000;
	
		if (action === 'save') {
			statusText = 'Contents saved';
		} else if (action === 'clear') {
			statusText = 'Contents cleared';				
		} else if (action === 'share') {
			statusText = 'Generating Link';
		}

		webNoted.webNoted(action);
		status.text(statusText).show('fast');

		setTimeout(function () {
			status.hide('fast');
		}, timeout);
	});

	$(window)
		.resize(function() {
			webNoted.trigger('resizeWebNoted');	
		})
		.on('beforeunload', function() {
			webNoted.webNoted('save');	
		})
	;

	if (noteId == '') {
		$("#home").hide();
	} else {
		$("#crud, #share, #history-container").hide();
	}

	$("body").show();
});
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