Array.from(document.getElementsByClassName("section img-text")).forEach(
    (ul, index, ulArray) => {
        if (index === 0) {//first section is intro/sylabus
            var section_name = "פתיחה"
        }
        else
        {
            var section_name = document.getElementsByClassName("sectionname")[index - 1].textContent;
        }
        var download_button = create_dl_button(ul,section_name);
        ul.insertBefore(download_button, ul.firstChild);
    }
)
chrome.runtime.sendMessage({ type: "course_name", course_name: getCourseName() });
function getCourseName()
{
    var nav_links = document.getElementsByClassName("breadcrumb-item");
    var course_link = nav_links[nav_links.length - 1];
    let full_course_name =  course_link.getElementsByTagName("a")[0].title;//includes course number
    return /(\D+)/g.exec(full_course_name)[0].trim();//TODO: add option to keep the course number
}

function validLink(link)
{
    return link !== "" && link.contains("resource");
}

function download_section_factory(section,section_name)
{
    function download_section(event)
    {
        event.preventDefault(); // Makes the <a> not redirect
        let links = Array.from(section.getElementsByTagName("a")).filter(link =>  link.href !== "" && link.href.includes("resource") );
        // chrome.runtime.sendMessage(section_name)
        Array.from(links).forEach(
            (link,index,link_array) =>
            {
                download_file(link.href)
            }
        )
        return false;
    }
    return download_section;
}

function download_file(url,filename)
{
    chrome.runtime.sendMessage({ type: "download", url: url }, function (response) { console.log("BYE!") });
}

function create_dl_button(section,section_name)
{
    const button_icon = "https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24";
    const button_text = "הורד את כל הפרק";
    const button_function = download_section_factory(section, section_name);

    var download_button = document.createElement("li");
    download_button.setAttribute("class", "activity resource modtype_resource ")
    const button_html = '<div><div class="mod-indent-outer"><div class="mod-indent"></div><div><div class="activityinstance"><a class="" onclick="" href="https://mw5.haifa.ac.il/mod/resource/view.php?id=11679"><img src="https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/pdf-24" class="iconlarge activityicon" alt=" " role="presentation"><span class="instancename">הרצאה 1 - מבוא<span class="accesshide "> קובץ</span></span></a> <span class="resourcelinkdetails">מסמך PDF</span></div></div></div></div>'
    download_button.innerHTML = button_html;

    var link = download_button.getElementsByTagName("a")[0];
    link.onclick = button_function;
    link.href = ""//Legal, makes page refresh on redirect

    var icon = download_button.getElementsByTagName("img")[0];
    icon.src = button_icon; //todo: custom icon
    var text = download_button.getElementsByClassName("instancename")[0];
    text.textContent = button_text;

    var desc = download_button.getElementsByClassName("resourcelinkdetails")[0];
    desc.textContent = "Mass Moodle Downloader"
    
    return download_button;
}
