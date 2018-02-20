var link_records = {};
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.type) {
            case "startup":
                chrome.pageAction.show(sender.tab.id);
                break;
            case "download":
                register_dl_object(request);
                chrome.downloads.download({
                    url: request.url,
                    conflictAction: chrome.downloads.FilenameConflictAction.overwrite//TODO: add options
                },
                    function (id) {
                        sendResponse("Done!");
                    });
                return true;
            case "video":
                register_dl_object(request);
                try_downloading_video(request);
                return true;
        }
    });

function try_downloading_video(dl_object) {

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