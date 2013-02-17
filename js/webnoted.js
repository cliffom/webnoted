$(function() {
	var webNoted = $("#webpad");
	var counterElement = $("#char-count span");
	var historyElement = $("#history");
	var shareDialogElement = $("#share-dialog");

	if (noteId == '') {
		$("#sidebar .shared").hide();
	} else {
		$("#sidebar .not-shared").hide();
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
			"dataStore": localStorage,
			"noteId": noteId
		})
		.on('resizeWebNoted', function() {
			webNoted.height($(window).height() - 88);
			webNoted.width($(window).width() - 298);
		})
		.on('shareLinkGenerated', function() {
			var url ="http://www.webnoted.com/" + webNoted.webNoted('getSharedHash');
			shareDialogElement
				.find("#success").show()
				.end()
				.find("#processing").hide()
				.end()
				.find("#error").hide()
				.end()
				.find("#shared-url")
				.attr("readonly", false)
				.val(url)
				.focus(function() { this.select(); })
				.select()
				.attr("readonly", true);
		})
		.on('shareLinkError', function() {
			shareDialogElement
				.find("#error").show()
				.end()
				.find("#success").hide()
				.end()
				.find("#processing").hide();
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

		if (action === 'create') {
			statusText = 'New note created';
		} else if (action === 'save') {
			statusText = 'Contents saved';
		} else if (action === 'clear') {
			statusText = 'Contents cleared';				
		} else if (action === 'share') {
			statusText = 'Generating Link';
			shareDialogElement
				.dialog("open")
				.find("#processing").show()
				.end()
				.find("#success").hide()
				.end()
				.find("#error").hide();
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