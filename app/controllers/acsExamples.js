var args = arguments[0] || {};
/**
 * Screen Initialization
 * */
function initialize() {
	$.topBar.imageContainer.addEventListener('click', closeWindow);
	$.topBar.setTitle(L('acs_examples'));
}

/**
 * Closes the window
 * */
function closeWindow() {
	$.win.close();
}

initialize();
/*
 * We'll follow a really simple paradigm in this example app. It's going to be a hierarchy of tables where you can drill
 * in to individual examples for each ACS namespace.
 *
 * To facilitate that, we will have a collection of "windowFunctions" like the "Users" window, and the "Login" window.
 *
 * These are defined in the "windows" folder and its children.
 *
 * That's it! Enjoy.
 */

// Include the window hierarchy.
Ti.include(
    '/acsExamples/windows/chats/table.js',
    '/acsExamples/windows/checkins/table.js',
    '/acsExamples/windows/clients/table.js',
    '/acsExamples/windows/customObjects/table.js',
    '/acsExamples/windows/emails/table.js',
    '/acsExamples/windows/events/table.js',
    '/acsExamples/windows/files/table.js',
    '/acsExamples/windows/friends/table.js',
    '/acsExamples/windows/geoFences/table.js',
    '/acsExamples/windows/photoCollections/table.js',
    '/acsExamples/windows/photos/table.js',
    '/acsExamples/windows/places/table.js',
    '/acsExamples/windows/posts/table.js',
    '/acsExamples/windows/keyValues/table.js',
    '/acsExamples/windows/likes/table.js',
    '/acsExamples/windows/messages/table.js',
    '/acsExamples/windows/pushNotifications/table.js',
    '/acsExamples/windows/pushSchedules/table.js',
    '/acsExamples/windows/reviews/table.js',
    '/acsExamples/windows/social/table.js',
    '/acsExamples/windows/status/table.js',
    '/acsExamples/windows/users/table.js',
    '/acsExamples/windows/accessControlLists/table.js'
);

var table = Ti.UI.createTableView({
    backgroundColor: '#fff',
    data: createRows([
        'Users',
        'Access Control Lists',
        'Chats',
        'Checkins',
        'Clients',
        'Custom Objects',
        'Emails',
        'Events',
        'Files',
        'Friends',
        'GeoFences',
        'Key Values',
        'Likes',
        'Messages',
        'Photo Collections',
        'Photos',
        'Places',
        'Posts',
        'Push Notifications',
        'Push Schedules',
        'Reviews',
        'Social',
        'Status'
    ])
});
table.addEventListener('click', handleOpenWindow);
$.win.add(table);
$.win.open();