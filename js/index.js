$(function () {
    var webNoted            = $("#webpad"),
        sideBarElement      = $("#sidebar"),
        historyElement      = $("#history"),
        footerElement       = $("#footer"),
        shareDialogElement  = $("#share-dialog"),
        deleteDialogElement = $("#delete-dialog"),
        renameDialogElement = $("#rename-dialog"),
        infoDialogElement   = $("#info-dialog"),
        shareDialogDivs     = shareDialogElement.find("div"),
        shareTextDefault    = $("#share-default-text"),
        shareTextProcessing = $("#processing"),
        shareTextError      = $("#error"),
        shareTextSuccess    = $("#success"),
        sharedUrlInput      = $("#shared-url"),
        infoTextCount       = $("#char-count"),
        infoTextCreated     = $("#note-created"),
        infoTextSaved       = $("#note-modified"),
        infoTextVersion     = $("#version"),
        newNoteNameInput    = $("#new-note-name"),
        renameTextError     = $("#rename-error"),
        tweetElement        = $("#tweet-link");

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
                    webNoted.webNoted("rename", webNoted.webNoted("getNewNoteName"));
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

    infoDialogElement.dialog({
       autoOpen:    false,
       modal:       true,
       resizable:   false,
       draggable:   false,
       width:       315,
       open: function() {
           var documentData = webNoted.webNoted("getDocumentData");
           infoTextCount.html(webNoted.webNoted("count"));
           infoTextCreated.html(new Date(documentData.created));
           infoTextSaved.html(new Date(documentData.lastSaved));
           infoTextVersion.html(webNoted.webNoted("version"));
       },
       close: function() {
           infoTextCount.html("");
           infoTextCreated.html("");
           infoTextSaved.html("");
       }
    });

    webNoted
        .on('resizeWebNoted', function () {
            webNoted.height($(window).height() - footerElement.height() - 88);
            webNoted.width($(window).width() - 298);
            roundedEdge(webNoted);
        })
        .on('wnContentChanged', function() {
            roundedEdge(webNoted);
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
        .trigger("wnContentChanged")
    ;

    historyElement.on("change", function (e) {
        var documentName = $(e.target).find(":selected").text();
        webNoted.webNoted("switchDocument", documentName);
        _StatHat.push(['_trackCount', 'SQt4WvvD9of0MXzg053l8yBTeVdi', 1.0]);
    });

    sideBarElement.find(".jsManageContents").click(function (e) {
        var action = e.currentTarget.id;
        e.preventDefault();

        if (action === "delete") {
            deleteDialogElement.dialog("open");
            _StatHat.push(['_trackCount', 'v3leA12Vm7MmaetWU7UPSCBXeEZK', 1.0]);
        } else if (action === "create") {
            webNoted.webNoted(action);
            _StatHat.push(['_trackCount', 'Oq2IAf-rg2mCBj1iQItS0yBLYUsy', 1.0]);
        } else if (action === "rename") {
            renameDialogElement.dialog("open");
            _StatHat.push(['_trackCount', 'fdWj1sG9cNGjQcVNHYU-_SA0R3B6Sw~~', 1.0]);
        } else if (action === "info") {
            infoDialogElement.dialog("open");
            _StatHat.push(['_trackCount', 'HjgEvt9kMmUZ8vwNmiIAfiBKNlcx', 1.0]);
        } else if (action === "share") {
            shareDialogElement.dialog("open");
            _StatHat.push(['_trackCount', 'a_8grwiXvKbByVkAAtFvwCA1M2NT', 1.0]);
        }
    });

    $(window)
        .resize(function () {
            webNoted.trigger("resizeWebNoted");
        })
        .on("blur unload", function () {
            webNoted.webNoted("save");
            _StatHat.push(['_trackCount', '4g3ytR38IC-eJw2zLIgRqSBZT2tH', 1.0]);
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
function roundedEdge(e) {
    var webNotedElement = e.get(0);
    if (webNotedElement.scrollHeight > webNotedElement.clientHeight) {
        e.css("border-radius", "4px 0 0 4px");
    } else {
        e.css("border-radius", "4px");
    }
}
