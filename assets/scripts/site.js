$(function () {
    function stringFormat() {
        var input = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            input = input.replace(reg, arguments[i + 1]);
        }
        return input;
    };

    // Open external links in a new window.
    $.expr[':'].external = function (obj) {
        return !(obj.href == "")
            && !obj.href.match(/^mailto\:/)
            && !(obj.hostname == location.hostname)
            && !$(obj).hasClass("twitter")
            && !$(obj).hasClass("googlePlus")
            && !$(obj).hasClass("facebook");
    };

    $("a:external").addClass("new-window");
        
    $("a.new-window").click(function () {
        window.open(this.href);
        return false;
    });

    // Share on Twitter and Google Plus.
    $(".twitter, .googlePlus").click(function (event) {
        var anchor = $(event.currentTarget);
        var width = 600, height = 600;
        var url = stringFormat(anchor.attr("href") + anchor.attr("data-href"),
                               encodeURIComponent(anchor.attr("data-text")),
                               encodeURIComponent(anchor.attr("data-url")));
        var left = (window.screen.width / 2) - (width / 2);
        var top = (window.screen.height / 2) - (height / 2);
        window.open(url, "",
                    stringFormat('toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width={0},height={1},top={2},left={3}', width, height, top, left));
        event.preventDefault();
    });

    // Share on Facebook.
    $(".facebook").click(function (event) {
        var anchor = $(event.currentTarget);
        var width = 800, height = 600;
        var url = stringFormat(anchor.attr("href") + anchor.attr("data-href"),
                               encodeURIComponent(anchor.attr("data-link")),
                               anchor.attr("data-has-picture").length >0 ? encodeURIComponent(anchor.attr("data-picture")) : "",
                               encodeURIComponent(anchor.attr("data-description")),
                               encodeURIComponent(anchor.attr("data-name")));
        var left = (window.screen.width / 2) - (width / 2);
        var top = (window.screen.height / 2) - (height / 2);
        window.open(url, "",
                    stringFormat('toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width={0},height={1},top={2},left={3}', width, height, top, left));
        event.preventDefault();
    });
});