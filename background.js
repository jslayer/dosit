function today(){
    var a = new Date;

    var b = new Date(a.getFullYear(), a.getMonth(), a.getDate());

    return [b.getDate(), b.getMonth(), b.getFullYear()].join('.')
}

chrome.storage.sync.get('data', function(v_data){
    setInterval(function(){
        chrome.tabs.query({
            active : true
        }, function(tabs){

            tabs.forEach(function(tab){
                chrome.tabs.sendMessage(tab.id, 'getFocus', function(response){
                    var key;

                    if (response) {
                        var host = response.host;

                        var focus = response.focus;

                        if (focus) {
                            key = [response.host, today()].join('_');

                            if (!v_data[key]) {
                                v_data[key] = 0;
                            }

                            v_data[key]++;
                        }
                    }
                });
            });

            //chrome.tabs.sendMessage()
        });
    }, 1000);

    setInterval(function(){
        chrome.storage.sync.set(v_data, function(){
            //console.log('saved', v_data);
        })
    }, 10000);

    chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
            switch (request) {
                case 'getData':
                    sendResponse(v_data);
                    break;
                default :
                //sendResponse({})
            }
        }
    );
});
