//chrome.extension.sendRequest(null, 'getData', function(response){
//    console.log(response);
//    //$scope.total_bad = 0;
//    //$scope.data = response.data;
//    //$scope.bs = response.bs;
//    //$scope.gs = response.gs;
//    //
//    //angular.forEach(response.data, function(list){
//    //    angular.forEach(list, function(item, host){
//    //        if ($scope.bs.indexOf(host) > -1) {
//    //            $scope.total_bad += item;
//    //        }
//    //    })
//    //});
//});

//chrome.storage.sync.getBytesInUse(function(used){
//    $scope.used = used;
//});

function get_host(){
    var lh, m;

    lh = location.href;
    m = lh.match(/d\=(.*)$/);

    return m && m[1];
}

angular.module('FrameApp', ['UI'])

    .controller('MainCtrl', ['$scope', '$interval', function($s, $i){
        var host, STATUSES;

        host = get_host();

        STATUSES = {
            NA : 0,
            UNKNOWN : 1,
            DENY : 2,
            ALLOW : 3
        };

        $s.SSS = STATUSES;

        $s.status = STATUSES.NA;

        $i(function(){
            chrome.extension.sendRequest(null, 'getTodayData', function(response){
                if (response && response.today){
                    $s.$apply(function(){
                        switch(true) {
                            case response.data.gs.indexOf(host) > -1:
                                $s.status = STATUSES.ALLOW;
                                break;
                            case response.data.bs.indexOf(host) > -1:
                                $s.status = STATUSES.DENY;
                                break;
                            default:
                                $s.status = STATUSES.UNKNOWN;
                        }
                        $s.c = response.today[host] || 0;
                    });
                }
            });
        }, 1000);
    }])
    .filter('dn', function(){
        var MV = [3600, 60, 1];

        return function(value){
            var i, l, f, _p, _val, parts;

            _val = value;
            parts = [];

            for (i = 0, l = MV.length; i < l; i++) {
                _p = (_val - _val % MV[i]) / MV[i];
                _val -= MV[i] * _p;

                if (_p > 0){
                    parts.push(_p < 10 ? '0' + _p : _p);
                }
            }

            return parts.join(' : ');
        }
    });