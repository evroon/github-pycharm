browser.runtime.onMessage.addListener(open_pycharm);

function open_pycharm(message) {
    fetch(message.url);
}
