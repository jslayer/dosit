function getToday(){
    var a, b;

    a = new Date;
    b = new Date(a.getFullYear(), a.getMonth(), a.getDate());

    return b.getTime();
}

function saveData(data){
    chrome.storage.sync.set(data, function(){
    });
}

chrome.storage.sync.get('data', function(v_data){
    if (!v_data.data) {
        v_data.data = {};
    }

    if (!v_data.bs) {
        v_data.bs = [];
    }

    if (!v_data.gs) {
        v_data.gs = [];
    }

    setInterval(function(){
        chrome.tabs.query({
            active : true
        }, function(tabs){

            tabs.forEach(function(tab){
                chrome.tabs.sendMessage(tab.id, 'getFocus', function(response){
                    var key, today, host, focus;

                    if (response) {
                        host = response.host;
                        focus = response.focus;

                        if (focus) {
                            today = getToday();

                            if (!v_data.data[today]) {
                                v_data.data[today] = {};
                            }

                            if (!v_data.data[today][response.host]) {
                                v_data.data[today][response.host] = 0;
                            }

                            v_data.data[today][response.host]++;
                        }

                        chrome.browserAction.setIcon({
                            path  : v_data.bs.indexOf(host) > -1 ? 'icon128_4.png' : 'icon128.png',
                            tabId : tab.id
                        }, function(){
                        });
                    }
                });
            });
        });
    }, 1000);

    setInterval(function(){
        saveData(v_data);
    }, 10000);

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
            switch (request) {
                case 'getData':
                    sendResponse(v_data);
                    break;
                case 'clearData':
                    chrome.storage.sync.clear(function(){
                        v_data = {
                            data : {},
                            bs   : [],
                            gs   : []
                        };
                        sendResponse('ok');
                    });
                    break;
                default :
                    if (request && request.request && request.data) {
                        switch (request.request) {
                            case 'saveBs':
                                v_data.bs = request.data;
                                saveData(v_data);
                                break;

                            case 'saveGs':
                                v_data.gs = request.data;
                                saveData(v_data);
                                break;
                        }
                    }
            }
        }
    );
});
