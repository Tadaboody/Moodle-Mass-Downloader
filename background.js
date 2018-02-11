var course_name = "";
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.type === "download"){
        chrome.downloads.download({ url: request.url},
            function (id) { sendResponse("Done!") });
        return true;
        }
        if(request.type === "course_name")
        {
            course_name = request.course_name;
        }
    });

chrome.downloads.onDeterminingFilename.addListener(suggest_file_name);
function suggest_file_name(download_item, suggest)
{
    download_item.filename = pathJoin(course_name,download_item.filename)
    suggest(download_item);
}

function pathJoin(...args)
{
    return args.reduce((a,b) => a + '\\' + b, 0);//TODO: linux support (\\\\ makes "file path too long")
}