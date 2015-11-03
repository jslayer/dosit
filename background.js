/*
 * Storage
 *
 * d : {uid:[domain, value, status]}
 *
 * Example:
 *
 * {
 *    domains : {
 *        55 : ['chrome.com' : 2]
 *    },
 *        DDMMYYYY : {
 *            55 : 2
 *        }
 *    }
 *    uid : 0
 * }
 *
 */

var STATUSES = {
    NA      : 0,
    UNKNOWN : 1,
    DENY    : 2,
    ALLOW   : 3
};


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
                    if (!v_data){
                        v_data = {};
                    }

                    if (!v_data.domains){
                        v_data.domains = {};
                    }

                    if (typeof v_data.uid !== 'number'){
                        v_data.uid = 0;
                    }

                    if (!v_data.val){
                        v_data.val = {};
                    }

                    Storage.setData(v_data);
                });
            }
        },

        getUid : function(host){
            var i, uid;

            uid = false;

            if (data){
                for (i in data.domains) {
                    if (data.domains.hasOwnProperty(i) && data.domains[i][0] === host){
                        uid = i;
                        break;
                    }
                }
            }

            if (uid === false){
                uid = data.uid++;
                data.domains[uid] = [host, STATUSES.UNKNOWN];
            }

            return uid;
        },

        incHost : function(host, date){
            var uid;

            uid = obj.getUid(host);

            if (!data.val[date]){
                data.val[date] = {};
            }

            if (!data.val[date][uid]){
                data.val[date][uid] = 0;
            }

            data.val[date][uid]++;
        },

        setStatus : function(host, status){
            data.domains[obj.getUid(host)][1] = status;
        },

        getStatus : function(host){
            return data.domains[obj.getUid(host)][1];
        },

        removeHost : function(host){
            var ix, i, i1;

            for (i in data.domains) {
                if (data.domains.hasOwnProperty(i) && data.domains[i][0] === host){
                    delete data.domains[i];

                    for (i1 in data.val) {
                        if (data.val.hasOwnProperty(i1)){
                            delete data.val[i1][i];
                        }
                    }
                    break;
                }
            }
        },

        getByDay : function(host, date){
            var uid;

            uid = obj.getUid(host);

            return {
                status : data.domains[obj.getUid(host)][1],
                data   : data.val[date] && data.val[date][uid] ? data.val[date][uid] : false
            }
        },

        getAllByDay : function(date){
            var day, rse, uid, host;

            day = data.val[date];

            if (day){
                rse = [];

                for (uid in day) {
                    if (day.hasOwnProperty(uid)){
                        rse.push({
                            h : host = data.domains[uid][0],
                            s : host = data.domains[uid][1],
                            v : day[uid]
                        });
                    }
                }
            }

            return rse;
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
                tabs.forEach(function(tab){
                    chrome.tabs.sendMessage(tab.id, 'getFocus', function(response){
                        var key, today, host, focus;

                        if (response && response.focus){
                            Storage.incHost(response.host, get_today());
                        }
                    });
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
            case 'clearData':
                chrome.storage.sync.clear(function(){
                    Storage.setData({
                        domains : {},
                        val     : {},
                        uid     : 0
                    });
                    sendResponse('ok');
                });
                break;
            default :
                if (request){
                    switch (request.type) {
                        case 'getTodayByHost':
                            var bd = Storage.getByDay(request.host, get_today());
                            sendResponse(bd);
                            break;

                        case 'getToday':
                            var td = get_today();

                            sendResponse({
                                data : Storage.getAllByDay(td),
                                date : td
                            });
                            break;

                        case 'setStatus':
                            Storage.setStatus(request.host, request.status);
                            sendResponse(true);
                            break;

                        case 'removeHost':
                            Storage.removeHost(request.host);
                            sendResponse(true);
                            break;
                    }
                }
        }
    }
);

