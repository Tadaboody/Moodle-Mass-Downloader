chrome.runtime.sendMessage({ type: "course_name", course_name: getCourseName() });
Array.from(document.getElementsByClassName("section img-text")).forEach(
    (ul, index, ulArray) => {
        var section_name = "";
        if (index === 0) {//first section is intro/sylabus
            section_name = "פתיחה";
        }
        else {
            section_name = document.getElementsByClassName("sectionname")[index - 1].textContent;
        }
        var download_button = create_dl_button(ul, section_name);
        ul.insertBefore(download_button, ul.firstChild);
    }
);

function getCourseName() {
    let full_course_name = document.getElementsByTagName("h1")[0].textContent;//includes course number
    return /(\D+)/g.exec(full_course_name)[1].trim();//TODO: add option to keep the course number
}

function validLink(link) {
    return link !== "" && link.contains("resource");
}

function download_section_factory(section, section_name) {
    function download_section(event) {
        event.preventDefault(); // Makes the <a> not redirect
        let links = Array.from(section.getElementsByTagName("a")).filter(link => link.href !== "" && link.href.includes("resource"));
        // chrome.runtime.sendMessage(section_name)
        Array.from(links).forEach(
            (link, index, link_array) => {
                var redirect_link = link.attributes.onclick.textContent;
                console.log(redirect_link);
                match = /window.open\('(.+)'/g.exec(redirect_link);
                console.log(match);
                if (match) {
                    download_file(match[1], section_name);
                } else {
                    download_file(link.href, section_name);
                }
            }
        );
        return false;
    }
    return download_section;
}

function download_file(url, section_name) {
    chrome.runtime.sendMessage({ type: "download", url: url, section_name: section_name }, function (response) { console.log("downloaded:" + url); });
}

function create_dl_button(section, section_name) {
    const button_icon = "https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24";
    const button_text = "הורד את כל הפרק";
    const button_function = download_section_factory(section, section_name);
    const desc_text = "Mass Moodle Downloader";

    var download_button = section.firstChild.cloneNode(true);
    download_button.setAttribute("id", "");
    var link = download_button.getElementsByTagName("a")[0];
    link.setAttribute("onclick", "");
    link.onclick = button_function;
    // link.href = ""//Legal, makes page refresh on redirect

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
