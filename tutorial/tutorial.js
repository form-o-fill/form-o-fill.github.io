/*global jQuery introJs window chrome document */
(function tutorialScope(jQuery) {
  "use strict";

  var extensionIds = ["bhokckolmdbgobnjlifcfigiihggcikh", "iebbppibdpjldhohknhgjoapijellonp", "kjcjehdmpjhomclllannjenijddhajfi"];

  var Tutorial = function() {
    this.steps = this.loadSteps();
    this.intro = this.initIntroJs();
  };

  Tutorial.prototype.loadSteps = function() {
    var steps = [];
    jQuery(".tuts .step").each(function (index) {
      var data = this.dataset;

      var step = {
        intro: this.innerHTML,
        element: data.element,
        position: data.position,
        trigger: data.trigger,
        tutorial: data.tutorial,
        buttons: (data.buttons === "false" ? false : true),
        overlay: (data.overlay === "false" ? false : true),
        importRules: (typeof data.importRules !== "undefined" ? document.querySelector("textarea" + data.importRules).textContent : null),
        index: index
      };

      steps.push(step);
    });

    return steps;
  };

  Tutorial.prototype.onBeforeChangeHandler = function(tutorial) {
    return function() {
      /*eslint-disable no-underscore-dangle */
      var stepIndex = tutorial.intro._currentStep;
      var step = tutorial.intro._introItems[stepIndex];
      /*eslint-enable no-underscore-dangle */

      step.tooltipClass = "step-" + stepIndex;
      step.position = tutorial.steps[stepIndex].position || "bottom";
      if(!step.buttons) {
        jQuery(".introjs-tooltipbuttons").hide();
        jQuery(".introjs-tooltipReferenceLayer").hide();
      } else {
        jQuery(".introjs-tooltipbuttons").show();
        jQuery(".introjs-tooltipReferenceLayer").show();
      }

      if(!step.overlay) {
        jQuery(".introjs-overlay").hide();
      } else {
        jQuery(".introjs-overlay").show();
      }
    };
  };


  // Send a message to the extension
  Tutorial.sendToExtension = function(action, message) {
    var messageHash = {
      action: action,
      message: message
    };

    extensionIds.forEach(function(extensionId) {
      chrome.runtime.sendMessage(extensionId, messageHash);
    });
  };

  Tutorial.prototype.onAfterChangeHandler = function(tutorial) {
    return function() {
      /*eslint-disable no-underscore-dangle */
      var stepIndex = tutorial.intro._currentStep;
      var step = tutorial.intro._introItems[stepIndex];
      /*eslint-enable no-underscore-dangle */

      // Send active tutorial number to Form-O-Fill extension
      if(typeof step.tutorial !== "undefined") {
        Tutorial.sendToExtension("activateTutorialOnOpenOptions", step.tutorial);
      }

      // Send import rules request to Form-O-Fill
      if(step.importRules) {
        Tutorial.sendToExtension("importDump", step.importRules);
      }

      var $helper = jQuery(".introjs-helperLayer");
      if(!step.overlay) {
        $helper.hide();
      } else {
        $helper.show();
      }
    };
  };

  Tutorial.prototype.initIntroJs = function() {
    var intro = introJs();

    intro.setOptions({
      steps: this.steps,
      nextLabel: "Next Step",
      skipLabel: "Cancel Tour",
      showBullets: false,
      showStepNumbers: false,
      keyboardNavigation: false,
      exitOnEsc: false,
      exitOnOverlayClick: false
    });

    intro.onbeforechange(this.onBeforeChangeHandler(this));
    intro.onafterchange(this.onAfterChangeHandler(this));

    return intro;
  };

  Tutorial.prototype.start = function() {
    var tutorial = this;
    jQuery(".tut-tour-start").on("click", function() {
      tutorial.intro.start();
    });
    this.observeDomChanges();
  };

  Tutorial.prototype.mutatedClassNames = function(nodeList) {
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

  Tutorial.prototype.domObserver = function(tutorial) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return new MutationObserver(function(mutations) {
      var added = [];
      var removed = [];

      mutations.forEach(function (mutation) {
        added = added.concat(tutorial.mutatedClassNames(mutation.addedNodes));
        removed = removed.concat(tutorial.mutatedClassNames(mutation.removedNodes));
      });

      tutorial.steps.every(function (step) {
        if(typeof step.trigger !== "undefined") {
          var checkAdded = (step.trigger[0] === "+" ? true : false);
          var triggerCls = step.trigger.substr(1);

          if(checkAdded && added.indexOf(triggerCls) !== -1) {
            // Trigger Step
            tutorial.intro.goToStep(step.index + 1);
            return false;
          }

          if(!checkAdded && removed.indexOf(triggerCls) !== -1) {
            // Trigger Step
            tutorial.intro.goToStep(step.index + 1);
            return false;
          }
        }
        return true;
      });
    });
  };

  Tutorial.prototype.observeDomChanges = function() {
    this.domObserver(this).observe(window.document.querySelector("body"), {
      childList: true,
      subtree: true
    });
  };

  window.tutorial = new Tutorial().start();

})(jQuery);
