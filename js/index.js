$(function () {
    var webNoted = $("#webpad"),
        sideBarElement = $("#sidebar"),
        historyElement = $("#history"),
        footerElement = $("#footer"),
        shareDialogElement = $("#share-dialog"),
        deleteDialogElement = $("#delete-dialog"),
        renameDialogElement = $("#rename-dialog");

    shareDialogElement.dialog({
        autoOpen:   false,
        modal:      true,
        resizable:  false,
        draggable:  false,
        width:      315
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
                $(this).dialog('close');
            },
            Cancel: function() {
                $(this).dialog('close');
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
                var newNoteName = $("#new-note-name").val();
                if (newNoteName.length > 0) {
                    webNoted.webNoted("rename", newNoteName);
                    $(this).dialog('close');
                } else {
                    $("#rename-error").html("* Please enter a note name.");
                }
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        },
        close: function() {
            $("#new-note-name").val("");
            $("#rename-error").html("");
        }
    });

    webNoted
        .on('resizeWebNoted', function () {
            webNoted.height($(window).height() - footerElement.height() - 88);
            webNoted.width($(window).width() - 298);
        })
        .on('wnShareLinkGenerated', function () {
            var url = webNoted.webNoted("getSharedUrl");

            shareDialogElement
                .find('.tweet-link')
                .html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + url + '" data-text="I shared a note:" data-count="none" data-hashtags="webnoted"></a>')
                .end().find("#success").show()
                .end().find("#processing").hide()
                .end().find("#error").hide()
                .end()
                .find("#shared-url")
                .attr("readonly", false)
                .val(url)
                .attr("readonly", true)
                .click(function() {
                    this.select();
                })
                .select();

            if (typeof twttr !== undefined) {
                twttr.widgets.load();
            }
        })
        .on('wnShareLinkError', function () {
            shareDialogElement
                .find("#error").show()
                .end().find("#success").hide()
                .end().find("#processing").hide();
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
            shareDialogElement
                .dialog("open")
                .find("#processing").show()
                .end().find("#success").hide()
                .end().find("#error").hide();
            webNoted.webNoted(action);
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
