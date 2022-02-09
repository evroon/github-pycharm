browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    open_pycharm(request, sender, sendResponse).then(sendResponse);
    return true; // we return true because the response is async
});

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 3000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

async function open_pycharm(request, sender, sendResponse) {
    try {
        await fetchWithTimeout(request.url);
        sendResponse({success: `Opened ${request.rel_path} on line ${request.line_number} (port ${request.port})`});
        // sendResponse({success: `Opened ${request.url})`});
    } catch (error) {
        // The space at the end of the string is necessary.
        var is_timeout = error.message == 'The operation was aborted. ';
        sendResponse({error: is_timeout ? 'A timeout occured.' : error.message});
    }
}
