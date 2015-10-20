var data;

angular.module('enoughApp', [])
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
    .controller('EnoughController', ['$scope', '$interval', function($scope, $interval){
        $scope.data = {};
        $scope.bs = [];
        $scope.gs = [];
        $scope.used = 0;
        $scope.total_bad = 0;

        $scope.clearAction = function(){
            $scope.data = {};
            $scope.bs = {};
            $scope.gs = {};
            chrome.extension.sendRequest(null, 'clearData', function(response){
            });
        };

        $scope.toggleBsAction = function(host){
            var ix;

            ix = $scope.bs.indexOf(host);

            if (ix > -1){
                $scope.bs.splice(ix, 1);
            }
            else {
                $scope.bs.push(host);
            }

            chrome.extension.sendRequest(null, ({
                request : 'saveBs',
                data    : $scope.bs
            }), function(){
            });
        };

        $scope.toggleGsAction = function(host){
            var ix;

            ix = $scope.gs.indexOf(host);

            if (ix > -1){
                $scope.gs.splice(ix, 1);
            }
            else {
                $scope.gs.push(host);
            }

            chrome.extension.sendRequest(null, ({
                request : 'saveGs',
                data    : $scope.gs
            }), function(){
            });
        };

        $interval(updateData, 1000);

        updateData();

        function updateData(){
            chrome.extension.sendRequest(null, 'getData', function(response){
                $scope.$apply(function(){
                    var data;

                    $scope.total_bad = 0;
                    $scope.bs = response.bs;
                    $scope.gs = response.gs;

                    data = [];

                    angular.forEach(response.data, function(v, k){
                        var idt = [];
                        angular.forEach(v, function(value, host){
                            idt.push({
                                h : punycode.toUnicode(host),
                                v : value
                            });
                        });

                        data.push({
                            date : k,
                            items : idt
                        });
                    });

                    $scope.data = data;

                    angular.forEach(response.data, function(list){
                        angular.forEach(list, function(item, host){
                            if ($scope.bs.indexOf(host) > -1){
                                $scope.total_bad += item;
                            }
                        })
                    });
                });
            });

            chrome.storage.sync.getBytesInUse(function(used){
                $scope.$apply(function(){
                    $scope.used = used;
                });
            });
        }

    }]);