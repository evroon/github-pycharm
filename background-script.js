browser.runtime.onMessage.addListener(notify);

function notify(message) {
    fetch(message.url);
}
