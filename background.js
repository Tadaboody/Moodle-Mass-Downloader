var course_name = "";
var link_section_name = {};
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.pageAction.show(sender.tab.id);
        if (request.type === "download") {
            link_section_name[request.url] = request.section_name;
            chrome.downloads.download({ url: request.url },
                function (id) { sendResponse("Done!"); });
            return true;
        }
        if (request.type === "course_name") {
            course_name = request.course_name;
            sendResponse();
        }
    });

chrome.downloads.onDeterminingFilename.addListener(suggest_file_name);
function suggest_file_name(download_item, suggest) {
    download_item.filename = pathJoin(course_name, link_section_name[download_item.url], download_item.filename);
    suggest(download_item);
}

function pathJoin(...args) {
    return args.reduce((a, b) => a + '\\' + b);//TODO: linux support (\\\\ makes "file path too long")
}