$(function () {
    var webNoted = $("#webpad"),
        sideBarElement      = $("#sidebar"),
        historyElement      = $("#history"),
        footerElement       = $("#footer"),
        shareDialogElement  = $("#share-dialog"),
        deleteDialogElement = $("#delete-dialog"),
        renameDialogElement = $("#rename-dialog"),
        shareDialogDivs     = shareDialogElement.find("div"),
        shareTextDefault    = shareDialogElement.find("#share-default-text"),
        shareTextProcessing = shareDialogElement.find("#processing"),
        shareTextError      = shareDialogElement.find("#error"),
        shareTextSuccess    = shareDialogElement.find("#success"),
        sharedUrlInput      = shareDialogElement.find("#shared-url"),
        newNoteNameInput    = $("#new-note-name"),
        renameTextError     = $("#rename-error"),
        tweetElement        = shareDialogElement.find(".tweet-link");
        
    sharedUrlInput
        .attr("readonly", true)
        .on("click", function() {
            this.select();
        });

    shareDialogElement.dialog({
        autoOpen:   false,
        modal:      true,
        resizable:  false,
        draggable:  false,
        width:      315,
        buttons: {
            "OK": function() {
                shareDialogDivs.hide();
                shareTextProcessing.show();
                shareDialogElement.next().hide();
                webNoted.webNoted("share");
            },
            Cancel: function() {
                shareDialogElement.dialog("close");
            }
        },
        open: function() {
          shareTextDefault.show();
        },
        close: function() {
            shareDialogDivs.hide();
            shareDialogElement.next().show();
        }
    });

    deleteDialogElement.dialog({
        autoOpen:   false,
        modal:      true,
        resizable:  false,
        draggable:  false,
        buttons: {
            "OK": function() {
                webNoted.webNoted("delete", webNoted.webNoted('getCurrentDocument'), true);
                if (historyElement.find("option").length === 0) {
                    webNoted.webNoted("rename", new Date());
                }
                deleteDialogElement.dialog('close');
            },
            Cancel: function() {
                deleteDialogElement.dialog('close');
            }
        }
    });

    renameDialogElement.dialog({
        autoOpen:   false,
        modal:      true,
        resizable:  false,
        draggable:  false,
        buttons: {
            "OK": function() {
                var newNoteName = newNoteNameInput.val();
                if (newNoteName.length > 0) {
                    webNoted.webNoted("rename", newNoteName);
                    renameDialogElement.dialog('close');
                } else {
                    renameTextError.html("* Please enter a note name.");
                }
            },
            Cancel: function() {
                renameDialogElement.dialog('close');
            }
        },
        close: function() {
            newNoteNameInput.val("");
            renameTextError.html("");
        }
    });

    webNoted
        .on('resizeWebNoted', function () {
            webNoted.height($(window).height() - footerElement.height() - 88);
            webNoted.width($(window).width() - 298);
        })
        .on('wnShareLinkGenerated', function () {
            var url = webNoted.webNoted("getSharedUrl");

            tweetElement.html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + url + '" data-text="I shared a note:" data-count="none" data-hashtags="webnoted"></a>');
            shareDialogDivs.hide();
            shareTextSuccess.show();
            sharedUrlInput.val(url).select();

            if (typeof twttr !== undefined) {
                twttr.widgets.load();
            }
        })
        .on('wnShareLinkError', function () {
            shareDialogDivs.hide();
            shareTextError.show();
        })
        .on('wnNoteRenamed wnNoteCreated wnReady wnNoteDeleted', function (e) {
            buildHistory(webNoted.webNoted("getSavedNotes"), webNoted.webNoted("getCurrentDocument"), historyElement);
            if (e.type === 'wnNoteDeleted') {
                webNoted.webNoted('canSave', false);
                historyElement.trigger('change');
                webNoted.webNoted('canSave', true);
            }
        })
        .on('wnEdited', function () {
            window.location = "/";
        })
        .on('wnNoStorage', function () {
            window.location = 'http://www.whatbrowser.org/';
        })
        .webNoted({
            "apiURL":   "/php/share.php"
        })
        .trigger("resizeWebNoted")
        .trigger("contentChanged")
    ;

    historyElement.on("change", function (e) {
        var documentName = $(e.target).find(":selected").text();
        webNoted.webNoted("switchDocument", documentName);
    });

    sideBarElement.find(".jsManageContents").click(function (e) {
        var action = e.currentTarget.id;
        e.preventDefault();

        if (action === "delete") {
            deleteDialogElement.dialog("open");
        } else if (action === "create") {
            webNoted.webNoted(action);
        } else if (action === "rename") {
            renameDialogElement.dialog("open");
        } else if (action === "share") {
            shareDialogElement.dialog("open");
        }
    });

    $(window)
        .resize(function () {
            webNoted.trigger("resizeWebNoted");
        })
        .on("blur unload", function () {
            webNoted.webNoted("save");
        })
    ;

    $.getScript("//platform.twitter.com/widgets.js");
});

function buildHistory(notes, currentDocument, historyElement) {
    historyElement.html('');
    $.each(notes, function (key, value) {
        key+=1;
        historyElement.append('<option value="' + key + '">' + value.substring(5) + '</option>');
        if (currentDocument === value) {
            historyElement.val(key).attr("selected", true);
        }
    });
}
