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
	var canSave = true;
	var counterElement;
	var currentDoc;
	var dataStore;
	var historyElement;
	var noteId;
	var settings;
	var sharedHash;
	var storageKey;
	var storageKeyPrefix;
	var version = '0.7';
	var webNoted;	

	var methods = {
		init: function(options) {
			webNoted = this;
			
			settings = $.extend({
				'counterElement': $("#counterElement"),
				'dataStore': localStorage,
				'storageKey': 'note',
				'noteId': '',
				'historyElement': ''
			}, options);
			
			counterElement = options['counterElement'];
			dataStore = options['dataStore'];
			storageKeyPrefix = options['storageKey'];
			storageKey = storageKeyPrefix;
			noteId = options['noteId'];
			historyElement = options['historyElement'];
			
			this
				.on('contentChanged', function() {
					setTimeout(function () {
						counterElement.html(webNoted.webNoted('count'));
					}, 0);
				})				
				.on('keyup paste', function() {
					webNoted.webNoted('refresh');
				})
			;
			
			if (noteId !== undefined) {
				storageKey = "#" + storageKey + "-" + noteId;
				if (dataStore.getItem(storageKey) != undefined) {
					webNoted.webNoted('open');
				} else {
					this.webNoted('loadShared');
				}
			} else {
				currentDoc = dataStore.getItem('currentDoc');
				if (currentDoc != undefined) {
					storageKey = currentDoc;
				}
				dataStore.setItem('currentDoc', storageKey);
				this
					.webNoted('open')
					.webNoted('setEditable')
					.webNoted('save')
				;
			}
			
			webNoted.webNoted('initHistory');

			return this;
		},
		
		/**
		 * TODO: I don't like this here, I feel there should be a method
		 * that returns history items in order to seperate logic
		 * from presentation
		 */
		initHistory: function() {
			for (var i = 0; i < dataStore.getStorageType().length; i++) {
				if (dataStore.getStorageType().key(i).substring(0, storageKeyPrefix.length) == storageKeyPrefix) {
					historyElement.find("select").append('<option value="' + dataStore.getStorageType().key(i) + '">'+dataStore.getStorageType().key(i).substring(0,18)+'</option>');
				}
			}

			if (!(historyElement.find("select").find("option").length > 1)) {
				historyElement.hide();
			} else {
				historyElement.find('select option[value=' + currentDoc + ']').attr('selected', 'selected');
				historyElement.find("select").change(function() {
					webNoted.webNoted('save');
					currentDoc = $(this).val();
					storageKey = currentDoc;
					dataStore.setItem('currentDoc', currentDoc);
					if (noteId !== undefined) {
						window.location = "/";
					} else {
						webNoted.
							webNoted('open')
							.focus()
						;
					}
				});
			}
		},

		save: function() {
			if (canSave) {
				dataStore.setItem(storageKey, webNoted.webNoted('getContents'));
			}
			return this;
		},		

		open: function() {
			webNoted
				.webNoted('setContents', dataStore.getItem(storageKey))
				.webNoted('refresh')
			;
			return this;
		},

		clear: function() {
			webNoted
				.webNoted('setContents', '')
				.webNoted('refresh')
			return this;
		},

		edit: function() {
			currentDoc = storageKeyPrefix + "-" + noteId;
			storageKey = currentDoc;
			dataStore.setItem('currentDoc', storageKey);
			webNoted.webNoted('save');
			window.location = "/";			
		},
		
		share: function() {
			$.ajax({
				url: '/api/',
				type: 'post',
				data: ({
					note: webNoted.webNoted('getContents')
				}),
				dataType: "text",
			}).done(function(msg) {
				var result = JSON.parse(msg);
				if (result.status === 'success') {
					sharedHash = result.hashId;
					webNoted.trigger('shareLinkGenerated');
				}
			});
			return this;
		},
		
		loadShared: function() {
			$.ajax({
				url: '/api/?noteId=' + noteId,
				type: 'get',
			}).done(function(msg) {
				var result = JSON.parse(msg);
				if (result.status === 'success') {
					webNoted
						.webNoted('setContents', result.result)
						.trigger('contentChanged')
						.webNoted('save')
					;
				} else {
					canSave = false;
					window.location = "/";
				}
			});
			return this;			
		},

		getSharedHash: function() {
			return sharedHash;
		},		

		refresh: function() {
			webNoted.trigger('contentChanged');
			return this;
		},

		getContents: function() {
			return webNoted.val();
		},

		setContents: function(contents) {
			webNoted.val(contents);
			return this;
		},

		setEditable: function() {
			webNoted
				.removeAttr('disabled')
				.focus();
			return this;
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
