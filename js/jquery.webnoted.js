/**
 * WebNoted - Turn your browser into a notepad
 * http://www.webnoted.com
 *
 * Copyright 2012, Michael Clifford
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * or GPL Version 2 (http://www.opensource.org/licenses/gpl-2.0.php) licenses.
 *
 */
(function ($) {
    var apiURL;
    var dataStore;
    var canSave = true;
    var noteId;
    var settings;
    var sharedUrl;
    var version = '1.0.8';
    var webNoted;

    var methods = {
        init:function (options) {
            webNoted = this;

            settings = $.extend({
                'apiURL':'/api/',
                'dataStore':localStorage,
                'noteId':''
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

            this.on('keyup paste', function () {
                webNoted.trigger('contentChanged');
            });

            return this;
        },

        save:function () {
            if (canSave) {
                dataStore.setItem(webNoted.webNoted('getCurrentDocument'), webNoted.webNoted('getContents'));
            }
            return this;
        },

        open:function () {
            webNoted.webNoted('setContents', dataStore.getItem(webNoted.webNoted('getCurrentDocument')));
            return this;
        },

        edit:function () {
            webNoted.webNoted('setCurrentDocument', webNoted.webNoted('getNewNoteName'));
            canSave = true;
            webNoted.webNoted('save');
            window.location = '/';
        },

        create:function () {
            webNoted.webNoted('save');
            webNoted.webNoted('clear');
            webNoted.webNoted('setCurrentDocument', webNoted.webNoted('getNewNoteName'));
            webNoted.webNoted('save');
            webNoted.trigger('noteCreated');
        },

        switchDocument:function (documentName) {
            webNoted.webNoted('save');
            webNoted.webNoted('setCurrentDocument', documentName);
            webNoted.webNoted('open');
        },

        clear:function () {
            webNoted.webNoted('setContents', '');
            return this;
        },

        share:function () {
            $.ajax({
                url:apiURL,
                type:'post',
                data:{
                    note:webNoted.webNoted('getContents')
                },
                dataType:'json',
                error:function (jqXHR, textStatus, errorThrown) {
                    webNoted.trigger('shareLinkError');
                }
            }).done(function (msg) {
                    try {
                        if (msg.status === 'success') {
                            sharedUrl = msg.sharedUrl;
                            webNoted.trigger('shareLinkGenerated');
                        } else {
                            webNoted.trigger('shareLinkError');
                        }
                    } catch (e) {
                        webNoted.trigger('shareLinkError');
                    }
                });
            return this;
        },

        getCurrentDocument:function () {
            var currentDocument = dataStore.getItem('currentDocument');
            if (currentDocument === null) {
                currentDocument = webNoted.webNoted('getNewNoteName');
                webNoted.webNoted('setCurrentDocument', currentDocument);
            }
            return currentDocument;
        },

        setCurrentDocument:function (documentName) {
            dataStore.setItem('currentDocument', documentName);
        },

        getNewNoteName:function () {
            var now = new Date;

            return 'note-' + now;
        },

        getSharedUrl:function () {
            return sharedUrl;
        },

        getContents:function () {
            return webNoted.val();
        },

        setContents:function (contents) {
            webNoted.val(contents).trigger('contentChanged');
            return this;
        },

        setEditable:function () {
            webNoted
                .removeAttr('readonly')
                .focus();
            return this;
        },

        getSavedNotes:function () {
            var savedNotes = [];
            for (var i = 0; i < dataStore.length; i++) {
                if (dataStore.key(i) !== null && dataStore.key(i).substring(0, 4) === 'note') {
                    savedNotes.push(dataStore.key(i));
                }
            }
            return savedNotes;
        },

        count:function () {
            return webNoted.val().length;
        },

        version:function () {
            return version;
        }
    };

    $.fn.webNoted = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.webNoted');
        }
    };
})(jQuery);
