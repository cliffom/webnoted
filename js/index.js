$(function() {
	var webNoted = $("#webpad");
	var dataStore = new WNDataStore(localStorage);
	var shareDialogElement = $("#share-message");
	var noteId = $.url(true).param('noteId')
	if (noteId === undefined) {
		noteId = $.url(true).segment(-1);
		if (noteId === '' || noteId === 'index.html') {
			noteId = undefined;
		}
	}

	if (noteId !== undefined) {
		$("#save, #clear, #share").hide();
		$("#edit").show();
	} else {
		$("#edit").hide();
	}

	webNoted
		.webNoted({
			"counterElement": $("#char-count span"),
			"dataStore": dataStore,
			"storageKey": 'note',
			"noteId": noteId,
			"historyElement": $("#history")
		})
		.on('resizeWebNoted', function() {
			$(this).height($(document).height() - 88);
		})
		.on('shareLinkGenerated', function() {
			var url ="http://www.webnoted.com/" + webNoted.webNoted('getSharedHash');
			shareDialogElement
				.find("input")
				.val(url)
				.focus(function() { this.select(); });
			shareDialogElement.dialog("open");
		})
		.trigger('resizeWebNoted')
	;

	shareDialogElement.dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		draggable: false
	});				

	$("#stats .jsManageContents").click(function() {
		var e = $(this);
		var defaultText = e.text();
		var statusText = '';
		var action = e.attr('id');
		var timeout = 750;

		if (action === 'save') {
			statusText = 'Contents saved';
		} else if (action === 'open') {
			statusText = 'Contents retrieved';
		} else if (action === 'clear') {
			statusText = 'Contents cleared';				
		} else if (action === 'share') {
			statusText = 'Generating Link';
		}

		webNoted.webNoted(action);
		e.text(statusText);

		setTimeout(function () {
			e.text(defaultText);
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