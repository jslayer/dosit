var data;

angular.module('enoughApp', [])
    .filter('bytes', function() {
        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        }
    })
    .filter('humanizeDuration', function() {
        return function(value) {
            return humanizeDuration(value * 1000, {
                language : 'en'
            });
        }
    })
    .controller('EnoughController', ['$scope', '$interval', function($scope, $interval){
        $scope.data = {};
        $scope.used = 0;

        $scope.clearAction = function() {
            $scope.data = {};
            chrome.extension.sendRequest(null, 'clearData', function(response){});
        };

        $interval(function(){
            chrome.extension.sendRequest(null, 'getData', function(response){
                $scope.data = response.data;
            });

            chrome.storage.sync.getBytesInUse(function(used) {
                $scope.used = used;
            });

        }, 1000);

    }]);