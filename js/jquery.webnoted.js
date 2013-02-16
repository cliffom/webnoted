/**
 * WebNoted - Turn your browser into a notepad
 * http://www.webnoted.com
 *
 * Copyright 2012, Michael Clifford
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 */
(function($) {
	var apiURL;
	var dataStore;
	var canSave = true;
	var noteId;
	var settings;
	var sharedHash;
	var version = '0.9.5';
	var webNoted;	

	var methods = {
		init: function(options) {
			webNoted = this;
			
			settings = $.extend({
				'apiURL': '/api/',
				'dataStore': localStorage,
				'noteId': ''				
			}, options);

			apiURL = options['apiURL'];
			dataStore = options['dataStore'];
			noteId = options['noteId'];

			if (noteId !== '') {
				canSave = false;
			} else {
				this.webNoted('open');
				this.webNoted('setEditable');
				this.webNoted('save');
			}

			this.on('keyup paste', function() {
				webNoted.trigger('contentChanged');
			});

			return this;
		},

		save: function() {
			if (canSave) {
				dataStore.setItem(webNoted.webNoted('getCurrentDocument'), webNoted.webNoted('getContents'));
			}
			return this;
		},		

		open: function() {
			webNoted.webNoted('setContents', dataStore.getItem(webNoted.webNoted('getCurrentDocument')));
			return this;
		},

		create: function() {
			var now = new Date;
			
			webNoted.webNoted('save');
			webNoted.webNoted('clear');
			webNoted.webNoted('setCurrentDocument', 'note-' + now);
			webNoted.webNoted('save');
			webNoted.trigger('noteCreated');
		},

		switchDocument: function(documentName) {
			webNoted.webNoted('save');
			webNoted.webNoted('setCurrentDocument', documentName);
			webNoted.webNoted('open');
		},

		clear: function() {
			webNoted.webNoted('setContents', '');
			return this;
		},

		share: function() {
			$.ajax({
				url: apiURL,
				type: 'post',
				data: ({
					note: webNoted.webNoted('getContents')
				}),
				dataType: "text"
			}).done(function(msg) {
				var result = JSON.parse(msg);
				if (result.status === 'success') {
					sharedHash = result.hashId;
					webNoted.trigger('shareLinkGenerated');
				}
			});
			return this;
		},

		getCurrentDocument: function() {
			var currentDocument = dataStore.getItem('currentDocument');
			if (currentDocument === null) {
				currentDocument = 'note';
				webNoted.webNoted('setCurrentDocument', currentDocument);
			}
			return currentDocument;
		},

		setCurrentDocument: function(documentName) {
			dataStore.setItem('currentDocument', documentName);
		},

		getSharedHash: function() {
			return sharedHash;
		},		

		getContents: function() {
			return webNoted.val();
		},

		setContents: function(contents) {
			webNoted.val(contents).trigger('contentChanged');
			return this;
		},

		setEditable: function() {
			webNoted
				.removeAttr('disabled')
				.focus();
			return this;
		},

		getSavedNotes: function() {
			var savedNotes = new Array;
			for (var i = 0; i <= dataStore.length; i++) {
				if (dataStore.key(i) !== null && dataStore.key(i).substring(0,4) === 'note') {
					savedNotes.push(dataStore.key(i));
				}
			}
			return savedNotes;
		},

		count: function() {
			return webNoted.val().length;
		},

		version: function() {
			return version;
		}
	};

	$.fn.webNoted = function(method) {
		if (methods[method]) {
			console.log('webNoted: ' + method);
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.webNoted');
		}
	};
})(jQuery);
