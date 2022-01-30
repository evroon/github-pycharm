var open_pycharm = function(rel_path) {
    if (rel_path == null) {
        var url_regex = /.*[/]blob[/][^/]*[/](.*)/;
        rel_path = url_regex.exec(window.location)[1];
    } else {
        var url_regex = /.*[[^R]*R(.*)/;
        var out = url_regex.exec(window.location);

        if (out && out.length > 1)
            rel_path += ':' + out[1];
    }

    var rel_path_formatted = rel_path.replace('#L', ':');
    var api_url = `http://localhost:63342/api/file/${rel_path_formatted}`;
    window.open(api_url);
};

var dropdown = document.getElementsByClassName("BlobToolbar-dropdown");
if (dropdown.length > 0) {
    // Handle blobs
    var pycharm_element = document.getElementById('js-copy-lines').cloneNode(true);
    pycharm_element.textContent = 'Open in PyCharm';
    pycharm_element.onclick = function() {
        open_pycharm();
    };

    var li = document.createElement("li");
    li.appendChild(pycharm_element);
    dropdown[0].appendChild(li);
} else {
    // Handle PRs
    var checkExist = setInterval(function() {
        if (document.getElementsByClassName('js-diff-progressive-container').length) {
           console.log("Container found");
           clearInterval(checkExist);

           var container = document.getElementsByClassName('js-diff-progressive-container');
           if (container.length > 0) {
               var parent = container[0].children;

               for (b of parent) {
                   var link_primary = b.querySelector('.Link--primary');

                   var pycharm_element = document.createElement('button');
                   pycharm_element.setAttribute('role', 'button');
                   pycharm_element.setAttribute('type', 'button');
                   pycharm_element.setAttribute('class', 'btn btn-sm');
                   pycharm_element.textContent = 'Open in PyCharm';
                   pycharm_element.onclick = function() {
                       open_pycharm(link_primary.textContent);
                   };
                   pycharm_element.removeAttribute('href');
                   link_primary.parentNode.appendChild(pycharm_element);
               }
           }
        }
     }, 100);
}
