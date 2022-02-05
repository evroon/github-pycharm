var get_pycharm_url = function(rel_path, line_number) {
    if (rel_path == null) {
        var url_regex = /.*[/]blob[/][^/]*[/](.*)/;
        rel_path = url_regex.exec(window.location)[1];
    } else {
        var url_regex = /.*[[^R]*R(.*)/;
        var out = url_regex.exec(window.location);

        if (out && out.length > 1)
            rel_path += ':' + out[1];
    }

    if (line_number) {
        rel_path += ':' + line_number;
    }

    var rel_path_formatted = rel_path.replace('#L', ':');
    return `http://localhost:63342/api/file/${rel_path_formatted}`;
};

var open_pycharm = function(api_url) {
    window.open(api_url);
};

function add_button_to_preview_window(link_primary) {
    var pycharm_element = document.createElement('button');

    var line_number_elm = link_primary.closest('.file').querySelector("td[data-line-number]");
    var line_number = null;
    if (line_number_elm) {
        line_number = line_number_elm.getAttribute('data-line-number');
    }
    var pycharm_url = get_pycharm_url(link_primary.textContent, line_number);

    pycharm_element.id = 'btn-pycharm-open';
    pycharm_element.title = pycharm_url;
    pycharm_element.setAttribute('role', 'button');
    pycharm_element.setAttribute('type', 'button');
    pycharm_element.setAttribute('class', 'btn btn-sm ml-auto mr-1');
    pycharm_element.textContent = 'Open in PyCharm';
    pycharm_element.onclick = function() {
        open_pycharm(pycharm_url);
    };
    pycharm_element.removeAttribute('href');

    link_primary.parentNode.appendChild(pycharm_element);
    link_primary.parentNode.classList.remove('mr-3');
}

function add_button_to_blob_dropdown(dropdown) {
    var pycharm_element = document.getElementById('js-copy-lines').cloneNode(true);
    pycharm_element.id = 'btn-pycharm-open';
    pycharm_element.textContent = 'Open in PyCharm';
    pycharm_element.onclick = function() {
        open_pycharm(get_pycharm_url());
    };

    var li = document.createElement("li");
    li.appendChild(pycharm_element);
    dropdown[0].appendChild(li);
}

function add_buttons() {
    var dropdown = document.getElementsByClassName("BlobToolbar-dropdown");
    var comments = document.getElementsByClassName("text-mono text-small Link--primary wb-break-all mr-2");

    if (dropdown.length > 0) {
        // Handle blobs
        add_button_to_blob_dropdown(dropdown);
    } else if (comments.length > 0) {
        // Handle comments of PRs
        for (var comment of comments)
            add_button_to_preview_window(comment);
    } else {
        // Handle "files changed" of PRs
        var container = document.getElementsByClassName('js-diff-progressive-container');
        if (container.length < 1)
            return;

        for (preview of container[0].children)
            add_button_to_preview_window(preview.querySelector('.Link--primary'));
    }
};

// It's hard to detect when GitHub opens a new link.
setInterval(function()
{
    if (!document.getElementById('btn-pycharm-open'))
        add_buttons();
}, 500);
