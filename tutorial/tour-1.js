/*global introJs window document $ */
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var tour1 = function() {
  "use strict";

  var tuts = [];
  $(".tuts .step").each(function (index) {
    var step = {};
    step.intro = this.innerHTML;
    step.element = this.dataset.element;
    step.position = this.dataset.position;
    step.trigger = this.dataset.trigger;
    step.buttons = this.dataset.buttons || "true";
    step.overlay = this.dataset.overlay || "true";
    step.index = index;
    tuts.push(step);
  });

  var intro = introJs();

  intro.setOptions({
    steps: tuts,
    nextLabel: "Next Step",
    skipLabel: "Cancel Tour",
    showBullets: false,
    showStepNumbers: false,
    keyboardNavigation: false,
    exitOnEsc: false,
    exitOnOverlayClick: false
  });

  intro.onbeforechange(function () {
    /*eslint-disable no-underscore-dangle */
    var stepIndex = intro._currentStep;
    var step = intro._introItems[stepIndex];
    /*eslint-enable no-underscore-dangle */
    step.tooltipClass = "step-" + stepIndex;
    step.position = tuts[stepIndex].position || "bottom";
    if(step.buttons === "false") {
      $(".introjs-tooltipbuttons").hide();
    } else {
      $(".introjs-tooltipbuttons").show();
    }

    if(step.overlay === "false") {
      $(".introjs-overlay").hide();
    } else {
      $(".introjs-overlay").show();
    }
  });

  intro.onafterchange(function () {
    var $helper = $(".introjs-helperLayer");
    if($helper.height() < 11) {
      $helper.hide();
    }
  });

  $(".tut-tour-1-start").on("click", function() { intro.start(); } );

  var classesForNodes = function(nodeList) {
    var mutClasses = [];
    var aNodes = [].slice.call(nodeList);

    if(aNodes.length > 0) {
      var classNames = aNodes.map(function (node) {
        return node.className;
      });
      classNames = classNames.filter(function (className) {
         return className !== "";
      });
      mutClasses = mutClasses.concat(classNames);
    }
    return mutClasses;
  };

  var observer = new MutationObserver(function(mutations) {
    var added = [];
    var removed = [];

    mutations.forEach(function (mutation) {
      added = added.concat(classesForNodes(mutation.addedNodes));
      removed = removed.concat(classesForNodes(mutation.removedNodes));
    });

    tuts.every(function (step) {
      if(typeof step.trigger !== "undefined") {
        var checkAdded = (step.trigger[0] === "+" ? true : false);
        var triggerCls = step.trigger.substr(1);

        if(checkAdded && added.indexOf(triggerCls) !== -1) {
          // Trigger Step
          intro.goToStep(step.index + 1);
          return false;
        }

        if(!checkAdded && removed.indexOf(triggerCls) !== -1) {
          // Trigger Step
          intro.goToStep(step.index + 1);
          return false;
        }
      }
      return true;
    });
  });

  observer.observe(document.querySelector("body"), {
    childList: true,
    subtree: true
  });
};

$(tour1);
