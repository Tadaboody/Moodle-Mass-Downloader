chrome.runtime.sendMessage({ type: "startup" }, create_buttons);

function create_buttons() {
    Array.from(document.getElementsByClassName("section img-text")).forEach(
        (ul, index) => {
            try {
                var section_name = "";
                if (index === 0) {//first section is intro/sylabus
                    section_name = "פתיחה";
                }
                else {
                    section_name = document.getElementsByClassName("sectionname")[index - 1].textContent;
                }
                var download_button = create_dl_button(ul, section_name, getCourseName());
                ul.insertBefore(download_button, ul.firstChild);
            } catch (error) {
                console.error(error);
            }
        }
    );
}

function getCourseName() {
    let full_course_name = document.getElementsByTagName("h1")[0].textContent;//includes course number
    return /(\D+)/g.exec(full_course_name)[1].trim();//TODO: add option to keep the course number
}

function validLink(link) {
    return link !== "" && link.contains("resource");
}

function download_section_factory(section, section_name, course_name) {
    function download_section(event) {
        event.preventDefault(); // Makes the <a> not redirect
        let file_anchors = Array.from(section.getElementsByTagName("a")).filter(link => link.href !== "" && link.href.includes("resource"));
        let possible_video_anchors = Array.from(section.getElementsByTagName("a")).filter(link => link.href.includes("url"));
        let download_record = { url: "", section_name: section_name, course_name };
        Array.from(file_anchors).forEach(
            anchor => {
                var redirect_link = anchor.attributes.onclick.textContent;
                var dl_link;
                match = /window.open\('(.+)'/g.exec(redirect_link); //in case the link opens a page it will have onclick=window.open(<LINK>)
                console.log(match);
                if (match) {
                    dl_link = match[1];
                } else {
                    dl_link = anchor.href;
                }
                download_record.url = dl_link;
                download_file(download_record);
            }
        );

        Array.from(possible_video_anchors).forEach(
            anchor => {
                download_record.url = anchor.href;
                download_possible_video(download_record);
            }
        );
        return false;//don't follow href
    }
    return download_section;
}

function download_file(dl_object) {
    chrome.runtime.sendMessage(Object.assign({
        type: "download"
    }, dl_object), function (response) {
        console.log("downloaded:" + url);
    });
}

function download_possible_video(dl_object) {
    chrome.runtime.sendMessage(Object.assign({
        type: "video"
    }, dl_object), function (response) {
        console.log("downloaded:" + url);
    });
}

function create_dl_button(section, section_name, course_name) {
    const button_icon = "https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24";
    const button_text = "הורד את כל קבצי הפרק";
    const button_function = download_section_factory(section, section_name, course_name);
    const desc_text = "Moodle Mass Downloader";


    var download_button = document.createElement("li");
    download_button.setAttribute("class", "activity resource modtype_resource ");
    const button_html = '<div><div class="mod-indent-outer"><div class="mod-indent"></div><div><div class="activityinstance"><a class="" onclick="" href="https://mw5.haifa.ac.il/mod/resource/view.php?id=11679"><img src="https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/pdf-24" class="iconlarge activityicon" alt=" " role="presentation"><span class="instancename">הרצאה 1 - מבוא<span class="accesshide "> קובץ</span></span></a> <span class="resourcelinkdetails">מסמך PDF</span></div></div></div></div>';
    download_button.innerHTML = button_html;
    var link = download_button.getElementsByTagName("a")[0];
    link.setAttribute("onclick", "");
    link.onclick = button_function;
    link.href = "";//Legal, makes page refresh on redirect

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
    }
    else {
        desc = desc_list[0];
    }
    desc.textContent = desc_text;
    activity_instance.appendChild(desc);

    return download_button;
}
