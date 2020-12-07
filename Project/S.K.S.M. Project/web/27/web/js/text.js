
function delayedAlert() {
  var timeoutID = window.setTimeout(expandLogo, 800);
}

function expandLogo() {
  $('.name').addClass('is-expanded');
}
delayedAlert();