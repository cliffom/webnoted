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
	var dataStore;
	var noteId;
	var settings;
	var sharedHash;
	var storageKey;
	var version = '0.7';
	var webNoted;	

	var methods = {
		init: function(options) {
			webNoted = this;
			
			settings = $.extend({
				'dataStore': localStorage,
				'storageKey': 'note',
				'noteId': '',
			}, options);
			
			dataStore = options['dataStore'];
			storageKey = options['storageKey'];
			noteId = options['noteId'];

			if (noteId !== undefined) {
				storageKey = "#" + storageKey + "-" + noteId;
				if (dataStore.getItem(storageKey) != undefined) {
					webNoted.webNoted('open');
				} else {
					this.webNoted('loadShared');
				}
			} else {
				this
					.webNoted('open')
					.webNoted('setEditable')
				;
			}

			this.on('keyup paste', function() {
				webNoted.trigger('contentChanged');
			});

			return this;
		},

		save: function() {
			if (canSave) {
				dataStore.setItem(storageKey, webNoted.webNoted('getContents'));
			}
			return this;
		},		

		open: function() {
			webNoted.webNoted('setContents', dataStore.getItem(storageKey));
			return this;
		},

		clear: function() {
			webNoted.webNoted('setContents', '')
			return this;
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
						.webNoted('save')
					;
				} else {
					window.location = "/";
				}
			});
			return this;			
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
