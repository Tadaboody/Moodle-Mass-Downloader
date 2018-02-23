var link_records = {};
chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {
        switch (request.type) {
            case "startup":
                chrome.pageAction.show(sender.tab.id);
                break;
            case "download":
                download_file(request, callback);
                return true;
            case "video":
                try_downloading_video(request, callback);
                return true;
        }
    });
function download_file(dl_object, callback) {
    register_dl_object(dl_object);
    chrome.downloads.download({
        url: dl_object.url,
        conflictAction: chrome.downloads.FilenameConflictAction.overwrite//TODO: add options
    },
        function (id) {
            callback(dl_object.url);
        });
}

function try_downloading_video(dl_object, callback) {
    //A videos link is a redirect to the page containing the video. we make a request to redirect to the video page and then download the url.mp4
    var initial_request = new XMLHttpRequest(); //for redirect
    var base_url;
    initial_request.onloadend = () => {
        if (initial_request.status === 200) {
            base_url = initial_request.responseURL.substr(0, initial_request.responseURL.lastIndexOf('/') + 1);
            let doc = initial_request.responseText;
            let match = /<iframe.*src="([^"]+)".*>/g.exec(doc);
            let media_src = match[1];
            let media_request = new XMLHttpRequest();
            media_request.open("GET", base_url + media_src);
            media_request.onloadend = () => {
                if (media_request.status === 200) {
                    let match = /MediaSrc\("([^"]+)"\);/.exec(media_request.responseText);
                    if (match) {
                        dl_object.url = base_url + match[1];
                        download_file(dl_object, callback);
                    }
                }
            };
            media_request.send();
        }
    };
    initial_request.open("GET", dl_object.url); 
    initial_request.response_type = "document";
    initial_request.send();
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