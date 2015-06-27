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
      Tutorial.sendToExtension("backupCurrentRules");
      Tutorial.sendToExtension("activateTutorialOnOpenOptions", 0);
      tutorial.intro.start();
      tutorial.observeDomChanges();
    });
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

  // This returns n array of text changed by the added DOM nodes
  Tutorial.prototype.mutatedTexts = function(nodeList) {
    var mutTexts = [];

    for(var i = 0; i < nodeList.length; i++) {
      if(nodeList[i].textContent) {
        mutTexts.push(nodeList[i].textContent);
      }
    }
    return mutTexts;
  };

  Tutorial.prototype.domObserver = function(tutorial) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return new MutationObserver(function(mutations) {
      var added = [];
      var removed = [];
      var attrs = [];
      var contentAdded = [];

      mutations.forEach(function (mutation) {
        added = added.concat(tutorial.mutatedClassNames(mutation.addedNodes));
        contentAdded = contentAdded.concat(tutorial.mutatedTexts(mutation.addedNodes));
        removed = removed.concat(tutorial.mutatedClassNames(mutation.removedNodes));
        if(typeof mutation.target.style !== "undefined") {
          attrs = attrs.concat(mutation.target.style.cssText);
        }
      });

      /*eslint-disable complexity */
      tutorial.steps.every(function (step) {
        if(typeof step.trigger !== "undefined") {
          var typeToCheck = step.trigger[0];
          var triggerCls = step.trigger.substr(1);

          if(added.indexOf(triggerCls) !== -1) {
            // + : element with class is visible
            if(typeToCheck === "+") {
              // Trigger Step
              tutorial.intro.goToStep(step.index + 1);
              return false;
            }

            // - : element with class is invisible
            if(typeToCheck === "-") {
              // Trigger Step
              tutorial.intro.goToStep(step.index + 1);
              return false;
            }
          }

          // elements style attributes change
          if(typeToCheck === "/") {
            var styleToCheckMatch = triggerCls.match(/^(.*?)\[(.*?)\]/);
            var found = attrs.filter(function (attr) {
              return attr.indexOf(styleToCheckMatch[2]) > -1;
            });

            if(found.length > 0) {
              tutorial.intro.goToStep(step.index + 1);
              return false;
            }
          }

          // triggers when text gets visible SOMEWHERE ON THE PAGE
          // does not work with form field
          if(typeToCheck === "?" && contentAdded.indexOf(triggerCls) > -1) {
            tutorial.intro.goToStep(step.index + 1);
            return false;
          }

          // *input[type=text]:input field content (again)
          // Checks for selector val() == "text"
          if(typeToCheck === "*") {
            var selectorAndContent = triggerCls.split(":");
            var $e = jQuery(selectorAndContent[0]);

            var regex = selectorAndContent[1].match(/^\/(.*?)\/$/);
            if(regex !== null && new RegExp(regex[1]).test($e.val())) {
              // regex matching!
              $e.data("trigger", "");
              step.trigger = "";
              tutorial.intro.goToStep(step.index + 1);
              return false;
            }

            if($e.val().indexOf(selectorAndContent[1]) > -1) {
              $e.data("trigger", "");
              step.trigger = "";
              tutorial.intro.goToStep(step.index + 1);
              return false;
            }
          }
        }
        /*eslint-enable complexity*/

        return true;
      });
    });
  };

  Tutorial.prototype.observeDomChanges = function() {
    var observer = this.domObserver(this);
    var observeDomElements = [ "body" ].map(function(selector) {
      return document.querySelector(selector);
    });

    observeDomElements.forEach(function (observeDomElement) {
      observer.observe(observeDomElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeFilter: ["style"]
      });
    });
  };

  window.tutorial = new Tutorial().start();

  jQuery("header").on("click", function() {
    window.location.href = "/";
  });
})(jQuery);
