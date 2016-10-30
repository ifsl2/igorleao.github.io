(function() {
    let app = angular.module("AspectJML", []);
})();

let CHANGE_STYLE_TIMEOUT = 5000;

function applySuccess() {
    $("footer").css("background-color", "#689F38")
    setTimeout(applyDefault, CHANGE_STYLE_TIMEOUT);
}

function applyDefault() {
    $("footer").css("background-color", "#f7f7f7")
}

function applyError() {
    $("footer").css("background-color", "#D32F2F")
    setTimeout(applyDefault, CHANGE_STYLE_TIMEOUT);
}

function applyWarning() {
    $("footer").css("background-color", "#FDD835")
    setTimeout(applyDefault, CHANGE_STYLE_TIMEOUT);
}
