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

function try_downloading_video(dl_object, responseCallback) {
    //A videos link is a redirect to the page containing the video. we make a request to redirect to the video page and then download the url.mp4
    var initial_request = new XMLHttpRequest(); //for redirect
    var base_url;
    initial_request.onprogress= () => {
        if(initial_request.responseURL.includes(".mp4"))
        {//Some links are directly to the mp4 file
            dl_object.url = initial_request.responseURL;
            download_file(dl_object,responseCallback);
            initial_request.onloadend = () => {}; //Don't do onloadend
        }
            initial_request.onprogress = () => {}; //Only run onprogress once
    };

    initial_request.onloadend = () => {
        console.log("Load end");
        if (initial_request.status === 200) {
            console.log("AAAAA");
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
                        download_file(dl_object, responseCallback);
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

function suggest_file_name(download_suggestion, suggest) {
    let link_record = link_records[download_suggestion.url];
    let file_ext = download_suggestion.filename.split('.').pop();
    let file_name = link_record.index.toString() + ' ' + link_record.displayed_name + '.' + file_ext;
    let file_path = pathJoin("הורדות מודל", link_record.course_name, link_record.section_name, file_name);
    download_suggestion.filename = file_path;
    download_suggestion.conflictAction = 'overwrite';
    console.log("suggested name=" + download_suggestion.filename);
    suggest(download_suggestion);
}

function pathJoin(...args) {
    console.log("args = " + args);
    let replace_slash_with_dash = string => string.replace(/\//g,'-');
    return args.reduce((a, b) => replace_slash_with_dash(a) + '\\' + replace_slash_with_dash(b)); //TODO: linux support (\\\\ makes "file path too long")
}