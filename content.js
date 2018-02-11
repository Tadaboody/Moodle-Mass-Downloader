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

function file_ext(image)
{
    known_ext = []
}
function download_file(url,filename)
{
    chrome.runtime.sendMessage({ type: "download", url: url }, function (response) { console.log("BYE!") });
}

function create_dl_button(section,section_name)
{
    const button_icon = "https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24";
    const button_text = "הורד הכל";
    const button_function = download_section_factory(section,section_name);
    //horrible javascript re-creating the html and styling of a moodle button
    var download_button = document.createElement("li");
    download_button.setAttribute("class","activity resource modtype_resource ")
        var div = document.createElement("div");
            var mod_indent_outer = document.createElement("div");
            mod_indent_outer.setAttribute("class","mod-indent-outer");
                var mod_indent = document.createElement("div");
                mod_indent.setAttribute("class","mod-indent");
            mod_indent_outer.appendChild(mod_indent);

            var inner_div = document.createElement("div");
                var activity_instance = document.createElement("div")
                activity_instance.setAttribute("class","activity");
                    var link = document.createElement("a");
                    link.onclick = button_function;
                    link.href = ""//Legal, makes page refresh on redirect

                        var icon = document.createElement("img");
    
                        icon.setAttribute("src",button_icon); //todo: custom icon
                        icon.setAttribute("class","iconlarge activityicon");
                        icon.setAttribute("alt"," ");
                        icon.setAttribute("role","presentation");
                        link.appendChild(icon);

                        var text = document.createElement("span");
                        text.setAttribute("class","instancename");
                            text.appendChild(document.createTextNode(button_text));
                            var access_hide = document.createElement("span");
                            access_hide.setAttribute("class","accesshide");
                            access_hide.appendChild(document.createTextNode("קובץ"));
                            text.appendChild(access_hide);
                        link.appendChild(text);
                    activity_instance.appendChild(link);
                inner_div.appendChild(activity_instance);
            div.appendChild(inner_div);
        download_button.appendChild(div);
    return download_button;
}
