windowFunctions['Remove Like'] = function (evt) {
    var win = createWindow();
    var offset = addBackButton(win);
    var content = Ti.UI.createScrollView({
        top: offset + u,
        contentHeight: 'auto',
        layout: 'vertical'
    });
    win.add(content);

    var userId = Ti.UI.createTextField({
        hintText: 'user_id',
        top: 10 + u, left: 10 + u, right: 10 + u,
        height: 40 + u,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
    });
    content.add(userId);

    var button = Ti.UI.createButton({
        title: 'Remove',
        top: 10 + u, left: 10 + u, right: 10 + u, bottom: 10 + u,
        height: 40 + u
    });
    content.add(button);


    function submitForm() {
        button.hide();

        Cloud.Likes.remove({
            user_id: userId.value
        }, function (e) {
            if (e.success) {
                alert('Removed!');
            }
            else {
                error(e);
            }
            button.show();
        });
    }

    button.addEventListener('click', submitForm);
    var fields = [ userId ];
    for (var i = 0; i < fields.length; i++) {
        fields[i].addEventListener('return', submitForm);
    }

    win.addEventListener('open', function () {
        userId.focus();
    });
    win.open();
};