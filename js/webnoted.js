$(function () {
    var noteId = getCookie("noteId"),
        webNoted = $("#webpad"),
        counterElement = $("#char-count").find("span"),
        sideBarElement = $("#sidebar"),
        historyElement = $("#history"),
        shareDialogElement = $("#share-dialog"),
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
                window.location = 'http://whatbrowser.org/';
            }
        }());

    if (noteId === null) {
        sideBarElement.find(".shared").hide();
    } else {
        sideBarElement.find(".not-shared").hide();
    }

    shareDialogElement.dialog({
        autoOpen:   false,
        modal:      true,
        resizable:  false,
        draggable:  false
    });

    webNoted
        .webNoted({
            "apiURL":       "/share.php",
            "dataStore":    storage,
            "noteId":       noteId
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
function getCookie(name)  {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value !== null) ? unescape(value[1]) : null;
}
