angular.module('UI', [])
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
    });