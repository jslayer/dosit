function get_today(){
    var a;

    a = new Date;

    return (new Date(a.getFullYear(), a.getMonth(), a.getDate())).getTime();
}

var Storage = (function(){
    var asked, data, cbs, obj, ready;

    cbs = [];
    asked = false;

    return obj = {
        isReady : function(){
            return ready;
        },

        getData : function(cb){
            if (!ready){
                cbs.push(cb);
            }
            else {
                cb(data);
            }

            if (!asked){
                asked = true;

                chrome.storage.sync.get('data', function(v_data){
                    if (!v_data) {
                        v_data = {};
                    }

                    if (!v_data.data){
                        v_data.data = {};
                    }

                    if (!v_data.bs){
                        v_data.bs = [];
                    }

                    if (!v_data.gs){
                        v_data.gs = [];
                    }

                    Storage.setData(v_data);
                });
            }
        },

        setData : function(value){
            data = value;

            if (ready){
                obj.saveData();
            } else {
                ready = true;

                cbs.forEach(function(cb){
                    cb(data);
                });

                cbs = [];
            }
        },

        saveData : function(){
            if (data){
                chrome.storage.sync.set(data, function(){
                });
            }
        }
    };
})();


Storage.getData(function(data){
    setInterval(function(){
        chrome.tabs.query({
            active : true
        }, function(tabs){

            if (tabs.length > 0){
                Storage.getData(function(data){
                    tabs.forEach(function(tab){
                        chrome.tabs.sendMessage(tab.id, 'getFocus', function(response){
                            var key, today, host, focus;

                            if (response){
                                host = response.host;
                                focus = response.focus;

                                if (focus){
                                    today = get_today();

                                    if (!data.data[today]){
                                        data.data[today] = {};
                                    }

                                    if (!data.data[today][response.host]){
                                        data.data[today][response.host] = 0;
                                    }

                                    data.data[today][response.host]++;
                                }

                                chrome.browserAction.setIcon({
                                    path  : data.bs.indexOf(host) > -1 ? 'icon128_4.png' : 'icon128.png',
                                    tabId : tab.id
                                }, function(){
                                });
                            }

                        });
                    })
                });
            }
        });
    }, 1000);

    setInterval(function(){
        Storage.saveData();
    }, 10000);
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
        switch (request) {
            case 'getData':
                Storage.getData(function(data){
                    sendResponse(data);
                });
                break;
            case 'clearData':
                chrome.storage.sync.clear(function(){
                    Storage.setData({
                        data : {},
                        bs   : [],
                        gs   : []
                    });
                    sendResponse('ok');
                });
                break;
            case 'getTodayData':
                Storage.getData(function(data){
                    var result, today;

                    today = get_today();

                    if (data && data.data && data.data[today]) {
                        result = {
                            today : data.data[today],
                            data  : data
                        };
                    }

                    sendResponse(result);
                });
                break;
            default :
                if (request && request.request && request.data){
                    Storage.getData(function(data){
                        switch (request.request) {
                            case 'saveBs':
                                data.bs = request.data;
                                Storage.setData(data);
                                //saveData(v_data);
                                break;

                            case 'saveGs':
                                data.gs = request.data;
                                Storage.setData(data);
                                break;
                        }
                    });
                }
        }
    }
);

