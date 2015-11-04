//var data;

var STATUSES = {
    NA      : 0,
    UNKNOWN : 1,
    DENY    : 2,
    ALLOW   : 3
};


angular.module('enoughApp', ['ngRoute'])
    .filter('bytes', function(){
        return function(bytes, precision){
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)){
                return '-';
            }
            if (typeof precision === 'undefined'){
                precision = 1;
            }
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    })
    .filter('duration', function(){
        return function(value){
            return humanizeDuration(value * 1000, {
                language : 'en'
            });
        }
    })
    .filter('host', function(){
        return function(value) {
            return punycode.toUnicode(value);
        }
    })
    .controller('MainCtrl', ['$scope', '$interval', function($s, $interval){
        $s.data = {};
        $s.bs = [];
        $s.gs = [];
        $s.used = 0;
        $s.SSS = STATUSES;
        $s.totalGood = 0;

        $s.clearAction = function(){
            $s.data = {};
            $s.bs = {};
            $s.gs = {};
            chrome.extension.sendRequest(null, 'clearData', function(response){
            });
        };

        $s.setStatus = function(item, status){
            chrome.extension.sendRequest(null, {
                type : 'setStatus',
                host : item.h,
                status : status
            }, function(){
            });
        };

        $s.remove = function(host){
            chrome.extension.sendRequest(null, {
                type : 'removeHost',
                host : host
            }, function(){
                $s.$apply();
            });
        };

        $interval(updateData, 1000);

        updateData();

        function updateData(){
            chrome.extension.sendRequest(null, {
                type : 'getToday'
            }, function(response){
                $s.$apply(function(){
                    var data;

                    $s.totalGood = 0;
                    $s.total = 0;

                    $s.data = response.data;
                    $s.date = response.date;

                    angular.forEach(response.data, function(item){
                        if (item.s === STATUSES.ALLOW) {
                            $s.totalGood += item.v;
                        }

                        $s.total += item.v;
                    });
                });
            });

            chrome.storage.sync.getBytesInUse(function(used){
                $s.$apply(function(){
                    $s.used = used;
                });
            });
        }
    }])
    .config([
        '$routeProvider', '$locationProvider',
        function($rp, $lp){
            $rp
                .when('/', {
                    controller  : 'MainCtrl',
                    templateUrl : 'popup-main.tpl.html'
                })
                .when('/week', {
                    controller  : 'MainCtrl',
                    templateUrl : 'popup-week.tpl.html'
                })
                .otherwise({
                    redirectTo : '/'
                });

            $lp.html5Mode(true);

            //$lp.html5Mode({
                //enabled : true,
                //requireBase : false
            //});
        }
    ]);
