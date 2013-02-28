/**
 * WebNoted - Turn your browser into a notepad
 * http://www.webnoted.com
 *
 * Copyright 2012, Michael Clifford
 */
(function ($) {
    var apiURL,
        storage,
        canSave = true,
        noteId,
        settings,
        sharedUrl,
        version = '1.0.14';

    var methods = {
        init:function (options) {
            var webNoted = this;

            settings = $.extend({
                'apiURL': '',
                'noteId': ''
            }, options);

            apiURL      = options.apiURL;
            noteId      = options.noteId;

            storage = (function() {
                var uid = new Date(),
                    storage,
                    result;
                try {
                    (storage = window.localStorage).setItem(uid, uid);
                    result = storage.getItem(uid) == uid;
                    storage.removeItem(uid);
                    return result && storage;
                } catch(e) {
                    return false;
                }
            }());

            if (noteId !== null) {
                canSave = false;
            } else {
                this
                    .webNoted('open')
                    .webNoted('setEditable')
                    .webNoted('save');
            }

            this.on('keyup paste', function () {
                webNoted.trigger('contentChanged');
            });

            return this;
        },

        save:function () {
            if (canSave && storage !== false) {
                storage.setItem(this.webNoted('getCurrentDocument'), this.webNoted('getContents'));
            }
            return this;
        },

        open:function () {
            if (storage !== false) {
                this.webNoted('setContents', storage.getItem(this.webNoted('getCurrentDocument')));
            }
            return this;
        },

        edit:function () {
            canSave = true;
            this
                .webNoted('setCurrentDocument', this.webNoted('getNewNoteName'))
                .webNoted('save');
            window.location = '/';
        },

        create:function () {
            this
                .webNoted('save')
                .webNoted('clear')
                .webNoted('setCurrentDocument', this.webNoted('getNewNoteName'))
                .webNoted('save')
                .trigger('noteCreated');
            return this;
        },

        switchDocument:function (documentName) {
            this
                .webNoted('save')
                .webNoted('setCurrentDocument', documentName)
                .webNoted('open');
            return this;
        },

        clear:function () {
            this.webNoted('setContents', '');
            return this;
        },

        share:function () {
            var webNoted = this;
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
            if (!storage) {
                return false;
            } else {
                var currentDocument = storage.getItem('currentDocument');
                if (currentDocument === null) {
                    currentDocument = this.webNoted('getNewNoteName');
                    this.webNoted('setCurrentDocument', currentDocument);
                }
                return currentDocument;
            }
        },

        setCurrentDocument:function (documentName) {
            if (storage !== false) {
                storage.setItem('currentDocument', documentName);
            }
            return this;
        },

        getNewNoteName:function () {
            var now = new Date();

            return 'note-' + now;
        },

        getSharedUrl:function () {
            return sharedUrl;
        },

        getContents:function () {
            return this.val();
        },

        setContents:function (contents) {
            this
                .val(contents)
                .trigger('contentChanged');
            return this;
        },

        setEditable:function () {
            this
                .removeAttr('readonly')
                .focus();
            return this;
        },

        getSavedNotes:function () {
            if (!storage) {
                return false;
            } else {
                var savedNotes = [];
                for (var i = 0; i < storage.length; i++) {
                    if (storage.key(i) !== null && storage.key(i).substring(0, 4) === 'note') {
                        savedNotes.push(storage.key(i));
                    }
                }
                return savedNotes;
            }
        },

        count:function () {
            return this.val().length;
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
