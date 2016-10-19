---
title: "Releasing version 3.0.0"
layout: default
---

# Releasing version 3.0.0

## TL;DR:
Form-O-Fill now matches rules on DOMContentLoaded.

---

## Today I'm releasing version 3 of Form-o-Fill.

This version includes one major change to the inner workings of Form-o-Fill which might potentially break your rules.

Previous versions of the extension started to search for matching rules the moment the page is *completely* loaded 
(that is including all assets like Javascript, CSS and images).  
In DOM speech that is the moment when the "load" event fires in the browser.

While this works it usually isn't necessary to wait that long.

So starting with version 3.0.0 Form-O-Fill will start matching when the DOM is complete ("DOMContentLoaded" event).

If that somehow breaks your rulesets you can revert back to the previous behaviour by activating the _"Match rules only when all assets are loaded"_ option in settings.

Have fun using the new version!

*Frank*
