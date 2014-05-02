/**
 * Initialization Parameters
 */
var calendars = [];
var selectedCalendarName;
var selectedid;
var pickerData = [];

/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('calendar'));

	// adding controls (view events, picker, scrollview) to the Calendar screen as per authorization
	if (OS_ANDROID) {
		performCalendarReadFunctions();
	} else if (OS_IOS) {
		if (Ti.Calendar.eventsAuthorization == Ti.Calendar.AUTHORIZATION_AUTHORIZED) {
			performCalendarReadFunctions();
		} else {
			Ti.Calendar.requestEventsAuthorization(function(e) {
				if (e.success) {
					performCalendarReadFunctions();
				} else {
					$.createEvent.width = "100%";
					alert('Access to calendar is not allowed');
				}
			});
		}
	}
}

/**
 * read events from calendar
 */
function performCalendarReadFunctions() {
	$.calendarView.visible = true;
	$.calendarView.height = Ti.UI.SIZE;
	$.viewEvent.visible = true;
	$.viewEvent.width = "36%";
	$.eventsView.visible = true;
	var selectableCalendars = Ti.Calendar.allCalendars;
	for (var i = 0, ilen = selectableCalendars.length; i < ilen; i++) {
		calendars.push({
			name : selectableCalendars[i].name,
			id : selectableCalendars[i].id
		});
		pickerData.push(Ti.UI.createPickerRow({
			title : calendars[i].name
		}));
		if (i === 0) {
			selectedCalendarName = selectableCalendars[i].name;
			selectedid = selectableCalendars[i].id;
		}
	}

	if (!calendars.length) {
		$.label.text = L('noCalAvail');
	} else {
		$.label.text = L("click_button");

		$.calendarPicker.add(pickerData);

		$.calendarPicker.addEventListener('change', function(e) {
			for (var i = 0, ilen = calendars.length; i < ilen; i++) {
				if (calendars[i].name === e.row.title) {
					selectedCalendarName = calendars[i].name;
					selectedid = calendars[i].id;
					Ti.API.info('Selected calendar that we are going to fetch is :: ' + selectedid + ' name:' + selectedCalendarName);
				}
			}
		});

		$.viewEvent.addEventListener('click', function(e) {
			$.label.text = L('generating');

			var currentYear = new Date().getFullYear();

			var consoleString = '';

			function print(s) {
				if (consoleString.length) {
					consoleString = consoleString + '\n';
				}
				consoleString = consoleString + s;
			}

			var calendar = Ti.Calendar.getCalendarById(selectedid);
			Ti.API.info('Calendar was of type' + calendar);
			Ti.API.info('calendar that we are going to fetch is :: ' + calendar.id + ' name:' + calendar.name);

			function printReminder(r) {
				if (OS_ANDROID) {
					var typetext = '[method unknown]';
					if (r.method == Ti.Calendar.METHOD_EMAIL) {
						typetext = 'Email';
					} else if (r.method == Ti.Calendar.METHOD_SMS) {
						typetext = 'SMS';
					} else if (r.method == Ti.Calendar.METHOD_ALERT) {
						typetext = 'Alert';
					} else if (r.method == Ti.Calendar.METHOD_DEFAULT) {
						typetext = '[default reminder method]';
					}
					print(typetext + ' reminder to be sent ' + r.minutes + ' minutes before the event');
				}
			}

			function printAlert(a) {
				if (OS_ANDROID) {
					print('Alert id ' + a.id + ' begin ' + a.begin + '; end ' + a.end + '; alarmTime ' + a.alarmTime + '; minutes ' + a.minutes);
				} else if (OS_IOS) {
					print('Alert absoluteDate ' + a.absoluteDate + ' relativeOffset ' + a.relativeOffset);
				}
			}

			function printEvent(event) {
				if (event.allDay) {
					print(L('event') + event.title + '; ' + event.begin + L('all_day'));
				} else {
					print(L('event') + event.title + '; ' + event.begin + ' ' + event.begin + '-' + event.end);
				}

				var reminders = event.reminders;
				if (reminders && reminders.length) {
					print(L('there_is_are') + reminders.length + L('reminder'));
					for (var i = 0; i < reminders.length; i++) {
						printReminder(reminders[i]);
					}
				}
				print(L('has_alarm') + event.hasAlarm);
				var alerts = event.alerts;
				if (alerts && alerts.length) {
					for (var i = 0; i < alerts.length; i++) {
						printAlert(alerts[i]);
					}
				}

				var status = event.status;
				if (status == Ti.Calendar.STATUS_TENTATIVE) {
					print(L('tentative_event'));
				}
				if (status == Ti.Calendar.STATUS_CONFIRMED) {
					print(L('confirmed_event'));
				}
				if (status == Ti.Calendar.STATUS_CANCELED) {
					print(L('canceled_event'));
				}
			}

			var events = calendar.getEventsInYear(currentYear);
			if (events && events.length) {
				print(events.length + L('event_in') + currentYear);
				print('');
				for (var i = 0; i < events.length; i++) {
					printEvent(events[i]);
					print('');
				}
			} else {
				print(L('no_event'));
			}

			$.label.text = consoleString;
		});
	}

}

/**
 * save events to calendar
 */
function performCalendarWriteFunctions() {

	var defCalendar = OS_IOS ? Ti.Calendar.defaultCalendar : Ti.Calendar.allCalendars[0];
	var date1 = new Date(new Date().getTime() + 3000), date2 = new Date(new Date().getTime() + 903000);
	Ti.API.info('Date1 : ' + date1 + 'Date2 : ' + date2);
	var event = defCalendar.createEvent({
		title : L("event_title"),
		notes : L("event_notes"),
		location : 'Appcelerator Inc',
		begin : date1,
		end : date2,
		availability : Ti.Calendar.AVAILABILITY_FREE,
		allDay : false,
	});
	if (OS_IOS) {
		var alert1 = event.createAlert({
			absoluteDate : new Date(new Date().getTime() - (1000 * 60 * 20))
		});
		var alert2 = event.createAlert({
			relativeOffset : -(60 * 15)
		});
		var allAlerts = new Array(alert1, alert2);
		event.alerts = allAlerts;
		var newRule = event.createRecurenceRule({
			frequency : Ti.Calendar.RECURRENCEFREQUENCY_MONTHLY,
			interval : 1,
			daysOfTheWeek : [{
				dayOfWeek : 1,
				week : 2
			}, {
				dayOfWeek : 2
			}],
			end : {
				occurrenceCount : 10
			}
		});
		event.recurrenceRules = [newRule];
		event.save(Ti.Calendar.SPAN_THISEVENT);
	} else {
		// Now add a reminder via e-mail for 10 minutes before the event.
		var reminderDetails = {
			minutes : 0,
			method : Ti.Calendar.METHOD_ALERT
		};

		event.createReminder(reminderDetails);
	}
}

/**
 * EVENT LISTENER
 */
/**
 * adds event to calendar if authorized
 */
function addCalendarEvent() {
	if (Ti.Calendar.eventsAuthorization == Ti.Calendar.AUTHORIZATION_AUTHORIZED) {
		performCalendarWriteFunctions();
	} else {
		Ti.Calendar.requestEventsAuthorization(function(e) {
			if (e.success) {
				performCalendarWriteFunctions();
			} else {
				alert('Access to calendar is not allowed');
			}
		});
	}
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.calendarWin.close();
}

initialize();
