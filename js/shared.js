$(function () {
    var webNoted = $("#webpad"),
        counterElement = $("#char-count").find("span");

    webNoted
        .webNoted({
            "apiURL":   "/php/share.php",
            "canSave":  false
        })
        .on('resizeWebNoted', function () {
            webNoted.height($(window).height() - 88);
            webNoted.width($(window).width() - 298);
            roundedEdge(webNoted);
        })
        .trigger("resizeWebNoted");

    counterElement.html(webNoted.webNoted("count"));

    $("#edit").on("click", function() {
       webNoted.webNoted("edit"); 
    });

    $(window).resize(function () {
        webNoted.trigger("resizeWebNoted");
    });
});
function roundedEdge(e) {
    var webNotedElement = e.get(0);
    if (webNotedElement.scrollHeight > webNotedElement.clientHeight) {
        e.css("border-radius", "4px 0 0 4px");
    } else {
        e.css("border-radius", "4px");
    }
}
