(function() {
    /*
    Check and set a global guard variable.
    If this content script is injected into the same page again,
    it will do nothing next time.
    */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    function parseCsvToSam(request, sender, sendResponse) {
        var xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';

        xhr.onload = function() {
            var recoveredBlob = xhr.response;
            var reader = new FileReader;
            reader.onload = function() {
                let rows = reader.result.split('\n');
                rows.pop();
                let tableRows = document.getElementsByClassName("student_list")[0].childNodes[1].getElementsByTagName("tr");
                for (let i = 1; i < rows.length; i++) {
                    let row = rows[i];
                    let columns = row.split('\t');
                    let name = columns[0];
                    name = name.replace(/ <.*>/g, "");
                    let nameComponents = name.split(' ');
                    let surname = nameComponents[nameComponents.length - 1];

                    // Start iterating the rows from two, as 1st row is hidden, 2nd is title
                    // Len -1 as column is empty
                    for (let j = 2; j < tableRows.length - 1; j++) {
                        let tableRow = tableRows[j].children;
                        let surnameInRow = tableRow[1].innerText.replace(/^\s+|\s+$/g, '');
                        let firstnameInRow = tableRow[2].innerText.replace(/^\s+|\s+$/g, '');
                        console.log("Looking for surname '" + surnameInRow + "' while actual surname was '" + surname + "'.");
                        if (surnameInRow === surname) {
                            let firstnameToCompare = nameComponents[0];
                            // Grab initials from surname
                            for (let nameCount = 1; nameCount < nameComponents.length - 1; nameCount++) {
                                firstnameToCompare += " " + nameComponents[nameCount].substr(0, 1);
                            }
                            if (firstnameInRow === firstnameToCompare) {
                                // Set option to okay
                                let selectBox = tableRow[tableRow.length - 1].children[0];
                                selectBox.selectedIndex = "1";
                            }
                        }
                    }
                }
            };
            reader.readAsText(recoveredBlob);
        };

        xhr.open('GET', request.csvURL);
        xhr.send();
    }

    /*
    Assign injectImage() as a listener for messages from the extension.
    */
    browser.runtime.onMessage.addListener(parseCsvToSam);
})();