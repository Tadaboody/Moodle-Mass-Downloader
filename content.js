Array.from(document.getElementsByClassName("section img-text")).forEach(
    (ul, index, ulArray) => {
        var download_button = create_dl_button(ul);
        ul.insertBefore(download_button, ul.firstChild);
    }
)


function download_section_factory(section)
{
    function download_section(event)
    {
        event.preventDefault(); // Make the <a> not redirect
        download_file("https://mw5.haifa.ac.il/mod/resource/view.php?id=79655","Fold/srs.pdf")
        // var links = section.getElementsByTagName("a");
        // var names = section.getElementsByClassName("instancename");
        // Array.from(links).forEach()
        return false;
    }
    return download_section;
}

function download_file(url,filename)
{
    chrome.runtime.sendMessage({ url: url, filename: filename }, function (response) {console.log("BYE!") });
}

function create_dl_button(section)
{
    const button_icon = "https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24";
    const button_text = "הורד הכל";
    const button_function = download_section_factory(section);
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
