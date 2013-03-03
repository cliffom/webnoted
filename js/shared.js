$(function () {
    var webNoted = $("#webpad"),
        counterElement = $("#char-count").find("span"),
        footerElement = $("#footer");

    webNoted
        .webNoted({
            "apiURL":   "/php/share.php",
            "canSave":  false
        })
        .on('resizeWebNoted', function () {
            webNoted.width($(window).width() - 298);
            webNoted.height($(window).height() - footerElement.height() - 88);
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
