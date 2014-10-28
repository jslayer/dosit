//console.log(
//    location.host
//);
//
//console.log(this);
//
//this.addEventListener('focus', function() {
//    console.log('FOCUS', location.host);
//}, false);
//
//this.addEventListener('blur', function() {
//    console.log('BLUR', location.host);
//}, false);

//setInterval(function() {
//  console.log(document.hasFocus(), location.host);
//}, 1000);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message) {
        case 'getFocus':
            sendResponse({
                host : location.host,
                focus : document.hasFocus()
            });
            break;
    }
})