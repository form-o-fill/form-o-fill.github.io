(function mainScope() {
  "use strict";
  document.querySelector("#install-inline").addEventListener("click", function() {
    chrome.webstore.install("https://chrome.google.com/webstore/detail/iebbppibdpjldhohknhgjoapijellonp");
  }, false);
})();
