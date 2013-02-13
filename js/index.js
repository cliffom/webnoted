$(function() {
	var webNoted = $("#webpad");
	var counterElement = $("#char-count span");
	var dataStore = new WNDataStore(localStorage);
	var shareDialogElement = $("#share-message");
	var noteId = getNoteId();

	if (noteId === undefined) {
		$("#home").hide();
	} else {
		$("#save, #clear, #share").hide();	
	}

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
			"storageKey": 'note',
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
		.trigger('resizeWebNoted')
		.trigger('contentChanged')
	;

	$("#sidebar .jsManageContents").click(function() {
		var e = $(this);
		var status = $("#status-message");
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
	$("body").show();
});