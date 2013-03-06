/**
 * WebNoted - Turn your browser into a notepad
 * http://www.webnoted.com
 *
 * Copyright 2012, Michael Clifford
 */
(function ($) {
    var apiURL,
        storage,
        canSave,
        sharedUrl,
        version = '1.0.19';

    var methods = {
        init:function (options) {
            var webNoted = this,
                settings = $.extend({
                    'apiURL': '',
                    'canSave': true
                }, options);

            apiURL  = settings.apiURL;
            canSave = settings.canSave;

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
                    webNoted.trigger('wnNoStorage');
                    return false;
                }
            }());

            if (canSave) {
                this
                    .webNoted('open')
                    .webNoted('setEditable')
                    .webNoted('save');
            }

            this.on('keyup paste', function () {
                webNoted.trigger('wnContentChanged');
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
                .webNoted('save')
                .trigger('wnEdited');
        },

        create:function () {
            this
                .webNoted('save')
                .webNoted('clear')
                .webNoted('setCurrentDocument', this.webNoted('getNewNoteName'))
                .webNoted('save')
                .trigger('wnNoteCreated');
            return this;
        },

        rename:function (newDocumentName) {
            var oldDocumentName = this.webNoted('getCurrentDocument');
            newDocumentName = 'note-' + newDocumentName;
            if (oldDocumentName !== newDocumentName) {
                this
                    .webNoted('save')
                    .webNoted('setCurrentDocument', newDocumentName)
                    .webNoted('setContents', storage.getItem(oldDocumentName))
                    .webNoted('save')
                    .webNoted('delete', oldDocumentName, false)
                    .trigger('wnNoteRenamed');
            }
            return this;
        },

        delete:function (documentName, trigger) {
            storage.removeItem(documentName);
            if (trigger !== false) {
                this.trigger('wnNoteDeleted');
            }
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
                    webNoted.trigger('wnShareLinkError');
                }
            }).done(function (msg) {
                try {
                    if (msg.status === 'success') {
                        sharedUrl = msg.sharedUrl;
                        webNoted.trigger('wnShareLinkGenerated');
                    } else {
                        webNoted.trigger('wnShareLinkError');
                    }
                } catch (e) {
                    webNoted.trigger('wnShareLinkError');
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
                .trigger('wnContentChanged');
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
