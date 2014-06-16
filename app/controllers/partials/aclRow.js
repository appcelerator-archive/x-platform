var args = arguments[0] || {};


$.rowTitle.text = args.data.title;
$.aclRow.id = args.data.id;
$.aclRow.hasCheck = args.data.hasCheck || false;