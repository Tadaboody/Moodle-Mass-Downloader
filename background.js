var link_records = {};
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.type) {
            case "startup":
                chrome.pageAction.show(sender.tab.id);
                break;
            case "download":
                download_file(request);
                return true;
            case "video":
                try_downloading_video(request);
                return true;
        }
    });
function download_file(dl_object) {
    register_dl_object(dl_object);
    chrome.downloads.download({
        url: dl_object.url,
        conflictAction: chrome.downloads.FilenameConflictAction.overwrite//TODO: add options
    },
        function (id) {
            sendResponse("Done!");
        });
}

function try_downloading_video(dl_object) {
    //A videos link is a redirect to the page containing the video. we make a request to redirect to the video page and then download the url.mp4
    var xhr = new XMLHttpRequest(); //for redirect
    xhr.onloadend = () => {
        console.log(xhr.readyState);
        switch (xhr.status) {
            case 200:
                dl_object.url = xhr.responseURL.substr(0, xhr.responseURL.lastIndexOf(".")) + ".mp4";//should work for most cases
                download_file(dl_object);
                break;
        }
    }; 
    xhr.open("GET", dl_object.url, true);
    xhr.response_type = "document";
    xhr.send();
}

function register_dl_object(dl_object) {
    link_records[dl_object.url] = dl_object;
}

chrome.downloads.onDeterminingFilename.addListener(suggest_file_name);

function suggest_file_name(download_item, suggest) {
    link_record = link_records[download_item.url];
    download_item.filename = pathJoin("הורדות מודל", link_record.course_name, link_record.section_name, download_item.filename);
    download_item.conflictAction = 'overwrite';
    console.log("suggested name=" + download_item.filename);
    suggest(download_item);
}

function pathJoin(...args) {
    console.log("args = " + args);
    return args.reduce((a, b) => a + '\\' + b); //TODO: linux support (\\\\ makes "file path too long")
}