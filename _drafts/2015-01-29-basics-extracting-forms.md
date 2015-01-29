---
title: "Basics: Extracting forms with Form-o-Fill"
layout: default
---

# Basics: Extract forms with Form-O-Fill 

This is the first part in a small series of blog post about the features found in Form-O-Fill.

The first very simple feature is form data extraction.

When you press the Form-O-Fill button (![Button with no rules matching](/img/form-extraction/button-when-not-matching.png)) while no 
matching rules where found you will see the popup displaying a link to create a rule:  
![Popup showing extract form link](/img/form-extraction/form-extraction-popup.png)

## Try it now!

Here is a demo form with some values for you:

<form class="demoform">
  Simple text field: <input type="text" value="A type=text field" /><br />
  HTML5 date field: <input type="date" value="2015-01-29" /><br />
  Checkbox: <input type="checkbox" name="a-checkbox" value="1" checked="checked" /><br />
  Radiobutton 1: <input type="radio" name="a-radiobutton" value="1" /><br />
  Radiobutton 2: <input type="radio" name="a-radiobutton" value="2" selected="selected" /><br />
  Textarea: <textarea>Textarea with lots of content</textarea>
</form>

After you click the "Create one?" link you will see a red transparent overlay
