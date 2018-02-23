//On Startup
chrome.runtime.sendMessage({
    type: "startup"
}, create_buttons);

function create_buttons() {
    let course_name = getCourseName();
    Array.from(document.getElementsByClassName("section img-text")).forEach(
        (section, index, section_list) => {
            try {
                let section_name = getSectionName(index);
                let download_file_button = create_section_files_dl_button(section, section_name, course_name);//undefined if section is empty of files
                let download_videos_button = create_section_video_dl_button(section, section_name, course_name);//undefined if section is empty of videos

                if(download_file_button){
                    section.insertBefore(download_file_button, section.firstChild); 
                }

                if(download_videos_button){
                section.insertBefore(download_videos_button, section.firstChild);
                }

                if (index == 0) {
                    let course_download_button = create_course_dl_button(section_list, course_name);
                    section.insertBefore(course_download_button, section.firstChild);
                }
            } catch (error) {
                console.error(error);
            }
        }
    );
}

function getCourseName() {
    let full_course_name = document.getElementsByTagName("h1")[0].textContent; //includes course number
    return /(\D+)/g.exec(full_course_name)[1].trim(); //TODO: add option to keep the course number
}

function getSectionName(section_index) {
    var section_name = "";
    if (section_index === 0) { //first section is intro/sylabus
        section_name = "פתיחה";
    } else {
        section_name = document.getElementsByClassName("sectionname")[section_index - 1].textContent;
    }
    return section_name;
}

function validLink(link) {
    return link !== "" && link.contains("resource");
}

function extract_url_from_anchor(anchor){
    var redirect_link = anchor.attributes.onclick.textContent;
    var dl_link;
    match = /window.open\('(.+)'/g.exec(redirect_link); //in case the link opens a page it will have onclick=window.open(<LINK>)
    console.log(match);
    if (match) {
        return match[1];
    } else {
        return anchor.href;
    }
}

function iterate_anchors_factory(anchor_list, section_name, course_name, callback)
{
    if (anchor_list.length == 0)
    {
        return undefined;
    }

    return function iterate_section()
    {
        let download_record = {
            url: "",
            section_name: section_name,
            course_name
        };
        Array.from(anchor_list).forEach(
            anchor => {
                download_record.url = extract_url_from_anchor(anchor);
                callback(download_record);
            }
        );
        return false;//don't follow href
    };
}

function download_section_videos_factory(section,section_name,course_name)
{
    let possible_video_anchors = Array.from(section.getElementsByTagName("a")).filter(link => link.href.includes("url"));
    return iterate_anchors_factory(possible_video_anchors, section_name, course_name, download_possible_video);
}

function download_section_files_factory(section, section_name, course_name) {
    let file_anchors = Array.from(section.getElementsByTagName("a")).filter(link => link.href.includes("resource"));
    return iterate_anchors_factory(file_anchors, section_name, course_name, download_file);
}

function download_section_list_factory(section_list, course_name) {
    function download_section_list() {
        Array.from(section_list).forEach(
            (section, index) => download_section_files_factory(section, getSectionName(index), course_name)()
        );
        return false;
    }
    return download_section_list;
}

function download_file(dl_object) {
    chrome.runtime.sendMessage(Object.assign({
        type: "download"
    }, dl_object), function (response) {
        console.log("downloaded:" + response);
    });
}

function download_possible_video(dl_object) {
    chrome.runtime.sendMessage(Object.assign({
        type: "video"
    }, dl_object), function (response) {
        console.log("downloaded:" + response);
    });
}

function create_dl_button(button_function, button_text) {
    if(button_function === undefined)
    {
        return undefined;
    }

    const button_icon = "https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24";
    const desc_text = "Moodle Mass Downloader";


    var download_button = document.createElement("li");
    download_button.setAttribute("class", "activity resource modtype_resource ");
    const button_html = '<div><div class="mod-indent-outer"><div class="mod-indent"></div><div><div class="activityinstance"><a class="" onclick="" href="https://mw5.haifa.ac.il/mod/resource/view.php?id=11679"><img src="https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/pdf-24" class="iconlarge activityicon" alt=" " role="presentation"><span class="instancename">הרצאה 1 - מבוא<span class="accesshide "> קובץ</span></span></a> <span class="resourcelinkdetails">מסמך PDF</span></div></div></div></div>';
    download_button.innerHTML = button_html;
    var link = download_button.getElementsByTagName("a")[0];
    link.setAttribute("onclick", "");
    link.onclick = event => {
        event.preventDefault(); //prevent redirect
        button_function();
    };
    link.href = ""; //Legal, makes page refresh on redirect

    var icon = download_button.getElementsByTagName("img")[0];
    icon.src = button_icon; //todo: custom icon
    var text = download_button.getElementsByClassName("instancename")[0];
    text.textContent = button_text;

    var activity_instance = download_button.getElementsByClassName("activityinstance")[0];
    let desc_list = activity_instance.getElementsByClassName("resourcelinkdetails");
    var desc = {};
    if (desc_list.length == 0) {
        desc = document.createElement("span");
        desc.setAttribute("class", "resourcelinkdetails");
    } else {
        desc = desc_list[0];
    }
    desc.textContent = desc_text;
    activity_instance.appendChild(desc);

    return download_button;
}

function create_debug_button(button_function) {
    const button_text = "DEBUG";
    return create_dl_button(button_function, button_text);
}

function create_section_files_dl_button(section, section_name, course_name) {
    const button_function = download_section_files_factory(section, section_name, course_name);
    const button_text = "הורד את כל קבצי הפרק";
    return create_dl_button(button_function, button_text);
}

function create_course_dl_button(section_list, course_name) {
    const button_function = download_section_list_factory(section_list, course_name);
    const button_text = "הורד את כל קבצי הקורס";
    return create_dl_button(button_function, button_text);
}

function create_section_video_dl_button(section, section_name, course_name) {
    const button_text = "הורד את כל סרטי הפרק";
    //Flattening the array means we can't know the section name for each one unless we have an object. Idea rejected!
    //const all_sections = [].concat(...section_list); //section_list.flatten() https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
    const button_function = download_section_videos_factory(section, section_name, course_name);
    return create_dl_button(button_function,button_text);
}