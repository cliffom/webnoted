$(function () {
    var webNoted = $("#webpad"),
        counterElement = $("#char-count").find("span"),
        sideBarElement = $("#sidebar"),
        historyElement = $("#history"),
        footerElement = $("#footer"),
        shareDialogElement = $("#share-dialog");

    shareDialogElement.dialog({
        autoOpen:   false,
        modal:      true,
        resizable:  false,
        draggable:  false,
        width:      315
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
        .on('wnContentChanged', function () {
            setTimeout(function () {
                counterElement.html(webNoted.webNoted("count"));
            }, 0);
        })
        .on('wnNoteCreated', function () {
            var documentName = webNoted.webNoted("getCurrentDocument");
            historyElement.append('<option value="' + documentName + '" selected="selected">' + documentName.substring(5) + '</option>');
        })
        .on('wnNoteRenamed', function () {
            buildHistory(webNoted.webNoted("getSavedNotes"), webNoted.webNoted("getCurrentDocument"), historyElement);
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
        webNoted.webNoted("switchDocument", $(e.target).val());
    });

    sideBarElement.find(".jsManageContents").click(function () {
        var e = $(this),
            status = $("#status-message"),
            statusText = '',
            action = e.attr("id"),
            timeout = 1000;

        if (action === "create") {
            statusText = "New note created";
        } else if (action === "save") {
            statusText = "Contents saved";
        } else if (action === "clear") {
            statusText = "Contents cleared";
        } else if (action === "share") {
            statusText = "Generating Link";
            shareDialogElement
                .dialog("open")
                .find("#processing").show()
                .end().find("#success").hide()
                .end().find("#error").hide();
        }

        webNoted.webNoted(action);
        status.text(statusText).show("fast");

        setTimeout(function () {
            status.hide("fast");
        }, timeout);
    });

    $(window)
        .resize(function () {
            webNoted.trigger("resizeWebNoted");
        })
        .on("blur unload", function () {
            webNoted.webNoted("save");
        })
    ;

    buildHistory(webNoted.webNoted("getSavedNotes"), webNoted.webNoted("getCurrentDocument"), historyElement);
    $.getScript("//platform.twitter.com/widgets.js");
});

function buildHistory(notes, currentDocument, historyElement) {
    historyElement.html('');
    $.each(notes, function (key, value) {
        historyElement.append('<option value="' + value + '">' + value.substring(5) + '</option>');
        if (currentDocument === value) {
            historyElement.val(value).attr("selected", true);
        }
    });
}
