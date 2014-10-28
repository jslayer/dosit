function getToday(){
    var a = new Date;

    var b = new Date(a.getFullYear(), a.getMonth(), a.getDate());

    return [b.getDate(), b.getMonth(), b.getFullYear()].join('.')
}

chrome.storage.sync.get('data', function(v_data){
    v_data = v_data || {};

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

                            if (!v_data[today]) {
                                v_data[today] = {};
                            }

                            if (!v_data[today][response.host]) {
                                v_data[today][response.host] = 0;
                            }

                            v_data[today][response.host]++;
                        }
                    }
                });
            });
        });
    }, 1000);

    setInterval(function(){
        chrome.storage.sync.set(v_data, function(){
        });
    }, 10000);

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
            switch (request) {
                case 'getData':
                    sendResponse({
                        data : v_data
                    });
                    break;
                case 'clearData':
                    chrome.storage.sync.clear(function(){
                        v_data = {};
                        sendResponse('ok');
                    });
                    break;
                default :
            }
        }
    );
});
