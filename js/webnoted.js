$(function () {
    var webNoted = $("#webpad");
    var counterElement = $("#char-count").find("span");
    var sideBarElement = $("#sidebar");
    var historyElement = $("#history");
    var shareDialogElement = $("#share-dialog");

    if (noteId == '') {
        sideBarElement.find(".shared").hide();
    } else {
        sideBarElement.find(".not-shared").hide();
    }

    shareDialogElement.dialog({
        autoOpen:false,
        modal:true,
        resizable:false,
        draggable:false
    });

    webNoted
        .webNoted({
            "apiURL":"/share.php",
            "dataStore":localStorage,
            "noteId":noteId
        })
        .on('resizeWebNoted', function () {
            webNoted.height($(window).height() - 88);
            webNoted.width($(window).width() - 298);
            roundedEdge(webNoted);
        })
        .on('shareLinkGenerated', function () {
            var url = webNoted.webNoted("getSharedUrl");
            shareDialogElement
                .find("#success").show()
                .end()
                .find("#processing").hide()
                .end()
                .find("#error").hide()
                .end()
                .find("#shared-url")
                .attr("readonly", false)
                .val(url)
                .focus(function () {
                    this.select();
                })
                .select()
                .attr("readonly", true);
        })
        .on('shareLinkError', function () {
            shareDialogElement
                .find("#error").show()
                .end()
                .find("#success").hide()
                .end()
                .find("#processing").hide();
        })
        .on('contentChanged', function () {
            roundedEdge(webNoted);
            setTimeout(function () {
                counterElement.html(webNoted.webNoted("count"));
            }, 0);
        })
        .on('noteCreated', function () {
            var documentName = webNoted.webNoted("getCurrentDocument");
            historyElement.append('<option value="' + documentName + '" selected="selected">' + documentName.substring(5) + '</option>');
        })
        .trigger("resizeWebNoted")
        .trigger("contentChanged")
    ;

    $.each(webNoted.webNoted("getSavedNotes"), function (key, value) {
        var currentDocument = webNoted.webNoted("getCurrentDocument");
        historyElement.append('<option value="' + value + '">' + value.substring(5) + '</option>');
        if (currentDocument === value) {
            historyElement.val(value).attr("selected", true);
        }
    });
    historyElement.on("change", function () {
        webNoted.webNoted("switchDocument", $(this).val());
    });

    sideBarElement.find(".jsManageContents").click(function () {
        var e = $(this);
        var status = $("#status-message");
        var statusText = '';
        var action = e.attr("id");
        var timeout = 1000;

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
                .end()
                .find("#success").hide()
                .end()
                .find("#error").hide();
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
});
function roundedEdge(e) {
    var webNotedElement = e.get(0);
    if (webNotedElement.scrollHeight > webNotedElement.clientHeight) {
        e.css("border-radius", "4px 0 0 4px");
    } else {
        e.css("border-radius", "4px");
    }
}
