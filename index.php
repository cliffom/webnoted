<html>
<head>
	<title>Notes in your browser</title>
	<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css" />
	<link rel="stylesheet" type="text/css" href="css/main.css">

	<script type="text/javascript" src="http://code.jquery.com/jquery.min.js"></script>
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js"></script>
	<script type="text/javascript" src="js/webnoted.js"></script>
	<script type="text/javascript" src="js/jquery.webnoted.js"></script>
</head>
<body>
	<div id="header">
		<h1>Take a quick note. Share a quick thought.</h1>
	</div>

	<div id="webpad"></div>
	<div id="sidebar">
		<div id="about" class="sidebarBox">
			<h2>About</h2>
			<p>WebNoted turns your browser into a notepad.</p>
			<h2>Usage</h2>
			<p>Simply start typing. Your notes are automatically saved.</p>
		</div>
		<div id="stats" class="sidebarBox">
			<h2>Stats</h2>
			<p id="char-count">Characters: <span>0</span></p>
			<h2>Options</h2>
			<p><a href="#" id="save" class="jsManageContents">Save contents</a></p>
			<p><a href="#" id="clear" class="jsManageContents">Clear contents</a></p>
			<p><a href="#" id="share" class="jsManageContents">Share this note</a></p>
			<p><a href="#" id="edit" class="jsManageContents">Edit as new</a></p>
		</div>
		<div id="history" class="sidebarBox">
			<h2>History</h2>
			<select id="history-list"></select>
		</div>
	</div>
	
	<div id="share-message" title="Share">
		<p>Paste link in <strong>email</strong> or <strong>IM</strong>:</p>
		<input type="text" style="width: 100%" />
		<p class="foot-note">* Shared links are not editable. Changes made after generating the link won't be viewable until you share a new link.</p>
	</div>
	
	<script type="text/javascript">
	$(function() {
		var webNoted = $("#webpad");
		var dataStore = new WNDataStore(localStorage);
		var shareDialogElement = $("#share-message");
		var noteId = $.url(true).param('noteId')
		
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
	});	
	</script>
	
</body>
</html>
