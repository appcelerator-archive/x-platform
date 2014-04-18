function open(){
	//http://docs.appcelerator.com/titanium/latest/#!/api/Titanium.Calendar
	var calendars = [];
	var selectedCalendarName;
	var selectedid;
	var pickerData = [];
	
	var win = Ti.UI.createWindow({
	  backgroundColor: 'white',
	  layout: 'vertical',
	  title: 'Calendar Demo',
	  modal:true
	});
	
	var close = Ti.UI.createButton({
		title:"Back",
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE,
		top:20,
		left:10
	});
	close.addEventListener("click",function(){
		win.close();
	});
	
	win.add(close);
	
	var createEvent = Ti.UI.createButton({
		title:"Create Sample Event",
		top:20,
		height:Ti.UI.SIZE
	});
	
	createEvent.addEventListener("click",addCalendarEvent);
	
	win.add(createEvent);
	
	//**read events from calendar*******
	function performCalendarReadFunctions(){
		
	    var scrollView = Ti.UI.createScrollView({
	      backgroundColor: '#eee',
	      height: 500,
	      top: 5
	    });
	
	    var label = Ti.UI.createLabel({
	      backgroundColor: 'white',
	      text: 'Click on the button to display the events for the selected calendar',
	      textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	      top: 20
	    });
	    scrollView.add(label);
	
	    var selectableCalendars = Ti.Calendar.allCalendars;
	    for (var i = 0, ilen = selectableCalendars.length; i < ilen; i++) {
	      calendars.push({ name: selectableCalendars[i].name, id: selectableCalendars[i].id });
	      pickerData.push( Ti.UI.createPickerRow({ title: calendars[i].name }) );
	      if(i === 0){
	        selectedCalendarName = selectableCalendars[i].name;
	        selectedid = selectableCalendars[i].id;
	      }
	    }
	    
	    if(!calendars.length){
	      label.text = 'No calendars available. Select at least one in the native calendar before using this app';
	    } else {
	      label.text = 'Click button to view calendar events';
	      
	      var picker = Ti.UI.createPicker({
	        top:20
	      });
	      
	      picker.add(pickerData);
	      win.add(picker);
	      
	      picker.addEventListener('change', function(e){
	        for (var i = 0, ilen = calendars.length; i < ilen; i++) {
	          if(calendars[i].name === e.row.title){
	            selectedCalendarName = calendars[i].name;
	            selectedid = calendars[i].id;
	            Ti.API.info('Selected calendar that we are going to fetch is :: '+ selectedid + ' name:' + selectedCalendarName);
	          }
	        }
	      });
	      
	      var button = Ti.UI.createButton({
	        title: 'View events',
	        top: 10
	      });
	      win.add(button);
	      
	      button.addEventListener('click', function(e){
	        label.text = 'Generating...';
	        
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
	        Ti.API.info('calendar that we are going to fetch is :: '+ calendar.id + ' name:' + calendar.name);
	        
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
	            print('Event: ' + event.title + '; ' + event.begin + ' (all day)');
	          } else {
	            print('Event: ' + event.title + '; ' + event.begin + ' ' + event.begin+ '-' + event.end);
	          }
	          
	          var reminders = event.reminders;
	          if (reminders && reminders.length) {
	            print('There is/are ' + reminders.length + ' reminder(s)');
	            for (var i = 0; i < reminders.length; i++) {
	                printReminder(reminders[i]);
	            }
	          }
	          print('hasAlarm? ' + event.hasAlarm);
	          var alerts = event.alerts;
	          if (alerts && alerts.length) {
	            for (var i = 0; i < alerts.length; i++) {
	              printAlert(alerts[i]);
	            }
	          }
	          
	          var status = event.status;
	          if (status == Ti.Calendar.STATUS_TENTATIVE) {
	            print('This event is tentative');
	          }
	          if (status == Ti.Calendar.STATUS_CONFIRMED) {
	            print('This event is confirmed');
	          }
	          if (status == Ti.Calendar.STATUS_CANCELED) {
	            print('This event was canceled');
	          }
	        }
	        
	        var events = calendar.getEventsInYear(currentYear);
	        if (events && events.length) {
	          print(events.length + ' event(s) in ' + currentYear);
	          print('');
	          for (var i = 0; i < events.length; i++) {
	            printEvent(events[i]);
	            print('');
	          }
	        } else {
	          print('No events');
	        }
	        
	        label.text = consoleString;
	      });
	    }
	
	    win.add(scrollView);
	}
	
	if (OS_ANDROID) {
	    performCalendarReadFunctions();
	} else if (OS_IOS) {
	    if (Ti.Calendar.eventsAuthorization == Ti.Calendar.AUTHORIZATION_AUTHORIZED) {
	        performCalendarReadFunctions();
	    } else {
	        Ti.Calendar.requestEventsAuthorization(function(e){
	            if (e.success) {
	                performCalendarReadFunctions();
	            } else {
	                alert('Access to calendar is not allowed');
	            }
	        });
	    }
	}
	
	win.open();
	
	function performCalendarWriteFunctions(){
		
	    var defCalendar = OS_IOS?Ti.Calendar.defaultCalendar:Ti.Calendar.allCalendars[0];
	    var date1 = new Date(new Date().getTime() + 3000),
	        date2 = new Date(new Date().getTime() + 903000);
	    Ti.API.info('Date1 : '+ date1 + 'Date2 : '+ date2);
	    var event = defCalendar.createEvent({
	            title: 'Sample Event',
	            notes: 'This is a test event created by an Appcelerator Demo App.',
	            location: 'Appcelerator Inc',
	            begin: date1,
	            end: date2,
	            availability: Ti.Calendar.AVAILABILITY_FREE,
	            allDay: false,
	    });
	    if(OS_IOS){
		    var alert1 = event.createAlert({
	                absoluteDate: new Date(new Date().getTime() - (1000*60*20))
	        });
		    var alert2 = event.createAlert({
		        relativeOffset:-(60*15)
		    });
		    var allAlerts = new Array(alert1,alert2);
		    event.alerts = allAlerts;
		    var newRule = event.createRecurenceRule({
		            frequency: Ti.Calendar.RECURRENCEFREQUENCY_MONTHLY,
		            interval: 1,
		            daysOfTheWeek: [{dayOfWeek:1,week:2},{dayOfWeek:2}],
		            end: {occurrenceCount:10}
		    });
		    event.recurrenceRules = [newRule];
		   	event.save(Ti.Calendar.SPAN_THISEVENT);
	   } else {
	   	// Now add a reminder via e-mail for 10 minutes before the event.
			var reminderDetails = {
			    minutes: 0,
			    method: Ti.Calendar.METHOD_ALERT 
			};
			
			event.createReminder(reminderDetails);
	   }
	}
	
	function addCalendarEvent(){
		if(Ti.Calendar.eventsAuthorization == Ti.Calendar.AUTHORIZATION_AUTHORIZED) {
		    performCalendarWriteFunctions();
		} else {
		    Ti.Calendar.requestEventsAuthorization(function(e){
		            if (e.success) {
		                performCalendarWriteFunctions();
		            } else {
		                alert('Access to calendar is not allowed');
		            }
		        });
		}
	}
}

module.exports = open;