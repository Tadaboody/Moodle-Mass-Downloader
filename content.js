Array.from(document.getElementsByClassName("section img-text")).forEach(
    (ul, index, ulArray) => {
        var download_button = create_dl_button();
        ul.insertBefore(download_button, ul.firstChild);

    }
)

function create_dl_button()
{
    var download_button = document.createElement("li");
    download_button.setAttribute("class","activity resource modtype_resource ")
        var div = document.createElement("div");
            var mod_indent_outer = document.createElement("div");
            mod_indent_outer.setAttribute("class","mod-indent-outer");
                var mod_indent = document.createElement("div");
                mod_indent.setAttribute("class","mod-indent");
            mod_indent_outer.appendChild(mod_indent);

            inner_div = document.createElement("div");
                var activity_instance = document.createElement("div")
                activity_instance.setAttribute("class","activity");
                    var link = document.createElement("a");
                        var icon = document.createElement("img");
                        icon.setAttribute("src","https://mw5.haifa.ac.il/theme/image.php/boost/core/1517353424/f/archive-24"); //TODO: custom icon
                        icon.setAttribute("class","iconlarge activityicon");
                        icon.setAttribute("alt"," ");
                        icon.setAttribute("role","presentation");
                        link.appendChild(icon);

                        var text = document.createElement("span");
                        text.setAttribute("class","instancename");
                            text.appendChild(document.createTextNode("הורד הכל"));
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
function GetSections()
{
    
}