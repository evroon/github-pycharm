const PORT = 63342;
const ANIM_DURATION = 3000; // milliseconds


function get_pycharm_url(rel_path, line_number, parent) {
    // Get the line number from inside a comment's preview window.
    // Depending on whether there is a suggestion in the comment,
    // we have to take either the first or second element that we find;
    if (parent) {
        var line_number_elms = parent.querySelectorAll('.blob-num-addition');
        var line_number_elm = line_number_elms.length > 1 ? line_number_elms[1] : line_number_elms[0];
        line_number = line_number_elm.getAttribute('data-line-number');
    }

    if (rel_path == null) {
        // Get the relative path from a blob's url
        var url_regex = /.*[/]blob[/][^/]*[/](.*)#L(.*)/;
        var matches = url_regex.exec(window.location);
        rel_path = matches[1];

        if (matches.length > 2)
            line_number = matches[2];
    } else {
        // Get the line number from a PR url ending with R9, for line 9.
        var url_regex = /.*[[^R]*R(.*)/;
        var matches = url_regex.exec(window.location);

        if (matches && matches.length > 1)
            line_number = matches[1];
    }
    var rel_path_with_line_number = rel_path;

    if (line_number)
        rel_path_with_line_number += ':' + line_number;

    return {
        'rel_path': rel_path,
        'line_number': line_number ? line_number : 1,
        'port': PORT,
        'url': `http://localhost:${PORT}/api/file/${rel_path_with_line_number}`,
    };
};

function show_message(type = 'success', message) {
    var toast = document.getElementsByClassName(`anim-fade-in fast Toast Toast--${type}`)[0];
    toast.getElementsByClassName('Toast-content')[0].textContent = message
    toast.removeAttribute('hidden');

    setTimeout(function()
    {
        toast.classList.add('anim-fade-out');
        setTimeout(function()
        {
            toast.setAttribute('hidden', '');
            toast.classList.remove('anim-fade-out');
        }, 310);
    }, 3000);
}

function handleResponse(message) {
    if (!message)
        return;

    if (message.hasOwnProperty('success'))
        show_message('success', message.success);
    else if (message.hasOwnProperty('error'))
        show_message('error', message.error);
    else
        show_message('error', message);
}

function open_pycharm(data) {
    // We send a request in a background script to avoid CORS issues.
    var sending = browser.runtime.sendMessage(data);
    sending.then(handleResponse, null);
};

function get_parent_recursive(element, count) {
    return count <= 0 ? element : get_parent_recursive(element.parentNode, count - 1);
}

function add_button_to_preview_window(link_primary, get_line_number) {
    var pycharm_element = document.createElement('button');
    var line_number = null;
    var parent = get_line_number ? get_parent_recursive(link_primary, 4) : null;

    pycharm_element.id = 'btn-pycharm-open';
    pycharm_element.setAttribute('role', 'button');
    pycharm_element.setAttribute('type', 'button');
    pycharm_element.setAttribute('class', 'btn btn-sm ml-auto mr-1');
    pycharm_element.textContent = 'Open in PyCharm';
    pycharm_element.onclick = function() {
        open_pycharm(get_pycharm_url(link_primary.title, line_number, parent));
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
        open_pycharm(get_pycharm_url(null, null, null));
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
            add_button_to_preview_window(comment, true);
    } else {
        // Handle "files changed" of PRs
        var containers = document.getElementsByClassName('js-diff-progressive-container');

        for (var container of containers) {
            for (preview of container.children)
                add_button_to_preview_window(preview.querySelector('.Link--primary'), false);
        }
    }
};

// It's hard to detect when GitHub opens a new link, so we check periodically
// whether the buttons have to be inserted.
setInterval(function()
{
    if (!document.getElementById('btn-pycharm-open'))
        add_buttons();
}, 500);
