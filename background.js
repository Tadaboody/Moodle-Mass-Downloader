chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Foo");
        chrome.downloads.download({url:request.url,filename:request.filename},
        function(id) {sendResponse("Done!")});
        return true;
    });