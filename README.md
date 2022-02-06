# GitHub PyCharm
This add-on adds buttons to GitHub pages that allow you to open files directly in PyCharm.

![preview](icons/preview.png)

## Usage
This add-on works for individual files, comments placed in PRs, the `files changed` tab for PRs and commits.
It will add buttons that, if pressed, open files in PyCharm. If you select a line in GitHub, it will
open the file at the correct line number. The first time, it will ask you to accept this request, which
must be accepted in order for this add-on to work.

This add-on should actually work for any Jetbrains IDE, not just PyCharm.

**Note**: PyCharm will have to be already opened with the correct project for this add-on to work.

## How it works
When you press the `Open in PyCharm` button, the content script will determine which file and
line number you are trying to open. The content script sends an event to the background script.
The event contains a URL that looks like: `http://localhost:63342/api/file/<file_to_open>:<line>`.
The background script sends an HTTP request to this URL. The Jetbrains IDE listens (by default) on this
port and will try to find the file you requested and open it in the IDE.

This feature is documented (not extensively) in [the docs](https://www.jetbrains.com/help/idea/php-built-in-web-server.html#configuring-built-in-web-server).
