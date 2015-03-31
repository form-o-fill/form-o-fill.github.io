(function mainScope() {
  "use strict";
  $("#install-button").on("click", function() {
    chrome.webstore.install("https://chrome.google.com/webstore/detail/iebbppibdpjldhohknhgjoapijellonp", function() { alert(1); }, function(err) { alert(err); });
  });
})();
