---
title: "Basics: Extracting forms with Form-o-Fill"
layout: default
---

# Basics: Extract forms with Form-O-Fill 

This is the first part in a small series of blog post about the features found in Form-O-Fill.

The first very simple feature is form data extraction.

When you press the Form-O-Fill button (![Button with no rules matching](/img/form-extraction/button-when-not-matching.png)) while no 
matching rules where found you will see the popup displaying a link to create a rule:  
<img alt="Popup showing extract form link" src="/img/form-extraction/form-extraction-popup.png" class="fig" />

## Try it now!

Here is a demo form with some values for you:

<form class="demoform">
  Simple text field: <input type="text" name="textfield" value="A type=text field" /><br />
  HTML5 date field: <input type="date" name="datefield" value="2015-01-29" /><br />
  Checkbox: <input type="checkbox" name="a-checkbox" value="1" checked="checked" /><br />
  Radiobutton 1: <input type="radio" name="a-radiobutton" value="1" /><br />
  Radiobutton 2: <input type="radio" name="a-radiobutton" value="2" checked="checked" /><br />
  Textarea: <textarea>Textarea with lots of content</textarea>
</form>

After you click the "Create one?" link you will see a red transparent overlay:  
<img alt="Click the other one" src="/img/form-extraction/form-extraction-overlay.png" class="fig" />

Click on the overlay covering the form and Form-O-Fill will show a notification in the upper right corner of the browser saying that it has extracted the data.  
Clicking on the notification will take you to the rules editor.
<img alt="Chrome notification" src="/img/form-extraction/form-extraction-notification.png" class="fig" />

Now just click the the link in the message at the top saying that there are extracted rules present and there you are!

Happy extracting.
