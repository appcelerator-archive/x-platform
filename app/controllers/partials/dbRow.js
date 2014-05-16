var args = arguments[0] || {};

$.rowTitle.text = args.first_name + " "+ args.last_name;
$.localDbRow.fname = args.first_name;
$.localDbRow.lname = args.last_name;
$.localDbRow.index = args.id;