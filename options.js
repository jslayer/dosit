var data;

angular.module('enoughApp', [])
    .filter('bytes', function(){
        return function(bytes, precision){
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '-';
            }
            if (typeof precision === 'undefined') {
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
        $scope.selection = [];
        $scope.used = 0;
        $scope.total = 0;

        $scope.clearAction = function(){
            $scope.data = {};
            $scope.selection = {};
            chrome.extension.sendRequest(null, 'clearData', function(response){
            });
        };

        $scope.toggleSelectionAction = function(host){
            var ix;

            ix = $scope.selection.indexOf(host);

            if (ix > -1) {
                $scope.selection.splice(ix, 1);
            }
            else {
                $scope.selection.push(host);
            }

            chrome.extension.sendRequest(null, ({
                request : 'saveSelection',
                data    : $scope.selection
            }), function(){
            });
        };

        $interval(function(){
            chrome.extension.sendRequest(null, 'getData', function(response){
                $scope.total = 0;
                $scope.data = response.data;
                $scope.selection = response.selection;

                angular.forEach(response.data, function(list){
                    angular.forEach(list, function(item){
                        $scope.total += item;
                    })
                });
            });

            chrome.storage.sync.getBytesInUse(function(used){
                $scope.used = used;
            });

        }, 1000);

    }]);