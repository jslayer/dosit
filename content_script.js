//console.log(
//    location.host
//);
//
//console.log(this);
//
//document.addEventListener('focus', function() {
//    console.log('FOCUS', location.host);
//}, false);
////
//this.addEventListener('blur', function() {
//    console.log('BLUR', location.host);
//}, false);

//setInterval(function() {
//  console.log(document.hasFocus(), location.host);
//}, 1000);

function get_host(){
    return location.host;
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    switch (message) {
        case 'getFocus':
            sendResponse({
                host  : get_host(),
                focus : document.hasFocus()
            });
            break;
    }
});

document.body.appendChild((function(){
    var w, f;

    w = document.createElement('div');
    f = document.createElement('iframe');

    f.style.cssText = 'width: 300px; height: 30px; position:fixed; bottom: 0; left: 50%; margin: 0 0 0 -150px; z-index: 1000000; border: none;';
    f.src = chrome.extension.getURL('frame.html?d=' + get_host());
    f.scrolling = 'no';

    w.appendChild(f);

    return w;
})());


