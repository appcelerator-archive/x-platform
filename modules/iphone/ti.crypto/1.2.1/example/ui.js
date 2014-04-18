App.UI = (function () {
    var algorithms = [
        { title:'AES-128', subTitle:'128-bit key', keySize:Crypto.KEYSIZE_AES128, algorithm:Crypto.ALGORITHM_AES128, options:Crypto.OPTION_PKCS7PADDING },
        { title:'AES-128', subTitle:'192-bit key', keySize:Crypto.KEYSIZE_AES192, algorithm:Crypto.ALGORITHM_AES128, options:Crypto.OPTION_PKCS7PADDING },
        { title:'AES-128', subTitle:'256-bit key', keySize:Crypto.KEYSIZE_AES256, algorithm:Crypto.ALGORITHM_AES128, options:Crypto.OPTION_PKCS7PADDING },
        { title:'DES', subTitle:'64-bit key', keySize:Crypto.KEYSIZE_DES, algorithm:Crypto.ALGORITHM_DES, options:Crypto.OPTION_PKCS7PADDING },
        { title:'3DES', subTitle:'192-bit key', keySize:Crypto.KEYSIZE_3DES, algorithm:Crypto.ALGORITHM_3DES, options:Crypto.OPTION_PKCS7PADDING },
        { title:'CAST', subTitle:'40-bit key', keySize:Crypto.KEYSIZE_MINCAST, algorithm:Crypto.ALGORITHM_CAST, options:Crypto.OPTION_PKCS7PADDING },
        { title:'CAST', subTitle:'128-bit key', keySize:Crypto.KEYSIZE_MAXCAST, algorithm:Crypto.ALGORITHM_CAST, options:Crypto.OPTION_PKCS7PADDING },
        { title:'RC4', subTitle:'8-bit key', keySize:Crypto.KEYSIZE_MINRC4, algorithm:Crypto.ALGORITHM_RC4, options:0 },
        { title:'RC4', subTitle:'4096-bit key', keySize:Crypto.KEYSIZE_MAXRC4, algorithm:Crypto.ALGORITHM_RC4, options:0 },
        { title:'RC2', subTitle:'8-bit key', keySize:Crypto.KEYSIZE_MINRC2, algorithm:Crypto.ALGORITHM_RC2, options:Crypto.OPTION_PKCS7PADDING },
        { title:'RC2', subTitle:'1024-bit key', keySize:Crypto.KEYSIZE_MAXRC2, algorithm:Crypto.ALGORITHM_RC2, options:Crypto.OPTION_PKCS7PADDING }
    ];

    // Currently selected crypto algorithm index
    var selectedIndex = 0;

    function createAppWindow() {
        var tabGroup = Ti.UI.createTabGroup();
        var win = createCryptoWindow();

        App.UI.tab = Ti.UI.createTab({ title:'Algorithms', window:win });
        tabGroup.addTab(App.UI.tab);
        return tabGroup;
    }

    ;

    function createCryptoWindow() {
        var win = Ti.UI.createWindow({
            title:'Algorithms',
            backgroundColor:'white',
            tabBarHidden:true
        });

        win.add(createCryptoTableView());

        return win;
    }

    ;

    function createCryptoTableView() {
        var tableView = Ti.UI.createTableView({});
        var cnt = algorithms.length;
        for (var index = 0; index < cnt; index++) {
            row = Ti.UI.createTableViewRow({ height: 45, layout:'vertical', hasChild:true });
            row.add(Ti.UI.createLabel({ text:algorithms[index].title, top:0, left:4, height:Ti.UI.SIZE || 'auto', width:Ti.UI.SIZE || 'auto', font:{ fontSize:16, fontWeight:'bold' } }));
            row.add(Ti.UI.createLabel({ text:algorithms[index].subTitle, top:0, left:4, height:Ti.UI.SIZE || 'auto', width:Ti.UI.SIZE || 'auto', font:{ fontSize:12 } }));
            tableView.appendRow(row);
        }
        tableView.addEventListener('click', openSelectionWindow);

        return tableView;
    }

    ;

    function openSelectionWindow(e) {
        var win = Ti.UI.createWindow({
            title:'API Usage',
            backgroundColor:'white',
            tabBarHidden:true
        });
        var data = [
            { title:'Single call', hasChild:true },
            { title:'Multiple calls', hasChild:true }
        ];
        var tableView = Ti.UI.createTableView({
            data:data
        });
        tableView.addEventListener('click', function (e) {
            if (e.index == 0) {
                openDemoWindow('cryptoSingle');
            } else if (e.index == 1) {
                openDemoWindow('cryptoMultiple');
            }
        });
        win.add(tableView);

        // Save the currently selected algorithm index
        selectedIndex = e.index;

        App.UI.tab.open(win, { animated:true });
    }

    function openDemoWindow(controller) {
        var demoWindow = Ti.UI.createWindow({
            backgroundColor:'white',
            layout:'vertical'
        });

        var demo = App.loadObject('controllers', controller, {});

        demoWindow.addEventListener('close', demo.cleanup);

        demo.init(algorithms[selectedIndex]);

        demo.create(demoWindow);

        App.UI.tab.open(demoWindow, { animated:true });
    }

    ;

    return {
        createAppWindow:createAppWindow
    };
})();
