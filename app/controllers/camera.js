/**
 * Screen Initialization
 * */
function initialize(){
	$.topBar.imageContainer.addEventListener('click',closeWindow);
	$.topBar.setTitle(L('camera'));
}

/**
 * EVENT LISTENER
 */
/**
 * Opens camera to capture picture / picture gallery and send the same as attachment.
 */
function emailPicture(){
	Alloy.Globals.apm.leaveBreadcrumb("emailPicture()"); 
	Ti.Analytics.featureEvent('EmailPhoto');
	
	if(Ti.Media.availableCameras && Ti.Media.availableCameras.length==0){
		Ti.Media.openPhotoGallery({
			success:email,
			cancel:function(){},
			error:function(){}
		});
	} else {
		Ti.Media.showCamera({
			success:email,
			cancel:function(){},
			error:function(){}
		});
	}
	
	function email(event){
		var photo = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "photo.png");
		photo.write(event.media);
		setTimeout(function(){
			var emailDialog = Ti.UI.createEmailDialog({
				subject : L("photo_attached"),
				toRecipients : [L("email_id")]
			});
			emailDialog.addAttachment(photo);
			emailDialog.open();
		},200);
		
	}
}

/**
 * Closes the window 
 * */
function closeWindow(){
	(OS_IOS)?Alloy.Globals.navGroup.closeWindow($.cameraWin): $.cameraWin.close();
}

initialize();
