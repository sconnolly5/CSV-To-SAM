/*
Injects a CSV BLOB into the active tab, will set the results of SAM.
*/

// Wait for file to be added through file picker prompt
const filePickerEle = document.getElementById("filePicker");
filePickerEle.addEventListener("change", filePicked, false);

// Wait for file to be dropped over file drag and drop area
const dropbox = document.getElementById("dropArea");
dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function filePicked() {
    csvToSam(this.files);
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    csvToSam(e.dataTransfer.files);
}

/*
 * Read the contents of the CSV and load them into SAM.
 */
function csvToSam(fileList) {
    const csvURL = window.URL.createObjectURL(fileList[0]);

    browser.tabs.executeScript({
            file: "/content_scripts/content.js"
        }).then(messageContent)
        .catch(reportError);

    function messageContent() {
        const gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true });
        gettingActiveTab.then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id, { csvURL });
        });
    }

    function reportError(error) {
        console.error(`Could not inject content script: ${error}`);
    }
}

///////////////////////////
// IGNORE DEFAULT BEHAVIOUR
///////////////////////////

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}