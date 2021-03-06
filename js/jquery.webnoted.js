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
        documentPrefix,
        documentData,
        version = '1.0.32';

    var methods = {
        init:function (options) {
            var webNoted = this,
                settings = $.extend({
                    'apiURL': '',
                    'documentPrefix': 'note-',
                    'canSave': true
                }, options);

            apiURL  = settings.apiURL;
            documentPrefix = settings.documentPrefix;
            this.webNoted('canSave', settings.canSave);

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

            this.trigger('wnReady');
            return this;
        },

        save:function () {
            if (canSave && storage !== false) {
                this.webNoted('setDocumentData', this.webNoted('getContents'), documentData.created, new Date());
                storage.setItem(this.webNoted('getCurrentDocument'), JSON.stringify(documentData));
            }
            return this;
        },

        open:function () {
            if (storage !== false) {
                var storedData = storage.getItem(this.webNoted('getCurrentDocument'));
                try {
                    storedData = JSON.parse(storedData);
                    this.webNoted('setDocumentData', storedData.noteContents, storedData.created, storedData.lastSaved);
                } catch(e) {
                    var date = new Date();
                    this.webNoted('setDocumentData', storedData, date, date);
                }

                this.webNoted('setContents', documentData.noteContents);
            }
            return this;
        },

        edit:function () {
            var date = new Date();
            this
                .webNoted('canSave', true)
                .webNoted('setDocumentData', this.webNoted('getContents'), date, date)
                .webNoted('setCurrentDocument', this.webNoted('getNewNoteName', true))
                .webNoted('save')
                .trigger('wnEdited');
        },

        create:function () {
            this
                .webNoted('save')
                .webNoted('clear')
                .webNoted('createNewDocument')
                .webNoted('setCurrentDocument', this.webNoted('getNewNoteName', true))
                .webNoted('save')
                .trigger('wnNoteCreated');
            return this;
        },

        createNewDocument:function() {
            var date = new Date();
            return this.webNoted('setDocumentData', '', date, date);
        },

        setDocumentData:function(contents, created, lastSaved) {
            documentData = {};
            documentData.noteContents = contents;
            documentData.created = created;
            documentData.lastSaved = lastSaved;
            return this;
        },

        getDocumentData:function() {
            return documentData;
        },

        rename:function (newDocumentName) {
            var oldDocumentName = this.webNoted('getCurrentDocument');
            newDocumentName = documentPrefix + newDocumentName;
            if (oldDocumentName !== newDocumentName) {
                this
                    .webNoted('save')
                    .webNoted('setCurrentDocument', newDocumentName)
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
                .webNoted('setCurrentDocument', documentPrefix + documentName)
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
                error:function () {
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
                    currentDocument = this.webNoted('getNewNoteName', true);
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

        getNewNoteName:function (usePrefix) {
            if (!storage) {
                return false;
            } else {
                var noteName;
                var numNotes = parseInt(storage.getItem('notesCreated'));
                if (isNaN(numNotes)) {
                    numNotes = 1;
                } else {
                    numNotes++;
                }
                storage.setItem("notesCreated", numNotes);
                noteName = "Untitled-" + numNotes;

                if (usePrefix === true) {
                    noteName = documentPrefix + noteName;
                }

                return noteName;
            }
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

        canSave:function (canSaveFlag) {
            canSave = (canSaveFlag === true);
            return this;
        },

        getSavedNotes:function () {
            if (!storage) {
                return false;
            } else {
                var savedNotes = [];
                for (var i = 0; i < storage.length; i++) {
                    if (storage.key(i) !== null && storage.key(i).substring(0, documentPrefix.length) === documentPrefix) {
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
        var dataToReturn = false;
        if (methods[method]) {
            dataToReturn = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            dataToReturn = methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.webNoted');
        }

        return dataToReturn;
    };
})(jQuery);
