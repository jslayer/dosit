var data;

angular.module('enoughApp', [])
    .controller('EnoughController', ['$scope', '$interval', function($scope, $interval){

        $scope.data = {};

        $interval(function(){
            console.log('1123');
            chrome.extension.sendRequest(null, 'getData', function(response){
                console.log(response);
                $scope.data = response;
                //$scope.apply();
            });
        }, 1000);

    }]);