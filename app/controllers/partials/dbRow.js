var args = arguments[0] || {};

$.firstName.text = args.first_name;
$.lastName.text = args.last_name;
$.localDbRow.fname = args.first_name;
$.localDbRow.lname = args.last_name;
$.localDbRow.index = args.id;

//Table click doesn't work for row children on blackberry so adding eventlistener
function initializeRow() {
	if (OS_BLACKBERRY) {
		$.del.addEventListener('click', function(e) {
			var del = args.delCallback;
			del($.localDbRow.index);
		});

		$.edit.addEventListener('click', function(e) {
			var edit = args.editCallback;
			edit($.localDbRow.fname, $.localDbRow.lname, $.localDbRow.index);
		});
	}
}

initializeRow();
