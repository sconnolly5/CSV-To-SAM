(function() {
    const PRESENT_INDEX = "1";

    /* Include guard */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    /**
     * Process the CSV file and insert the results into the SAM table.
     * @param {*} request The request which was sent from the sidebar to this window
     * @param {*} sender The owner of the request
     * @param {*} sendResponse A reference object if we want to return a response to the sender
     */
    function parseCsvToSam(request, sender, sendResponse) {
        var xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';

        // Send a request to retrieve the blob.
        xhr.onload = function() {
            var recoveredBlob = xhr.response;
            var reader = new FileReader;
            reader.onload = function() {
                // Process the CSV contained in the BLOB 
                try {
                    processCsvRows(reader);
                } catch (e) {
                    // Probably wasn't on the correct SAM page.
                } finally {
                    // Release the BLOB to avoid memory leaks
                    URL.revokeObjectURL(xhr.response);
                }
            };
            reader.readAsText(recoveredBlob);
        };

        xhr.open('GET', request.csvURL);
        xhr.send();
    }

    /**
     * Check each row in the CSV file, extract a name, check if the table contains the name, if so set status to OK.
     * @param {FileReader} reader 
     */
    function processCsvRows(reader) {
        let csvRows = reader.result.split('\n');
        csvRows.pop();
        let tableRows = document.getElementsByClassName("student_list")[0].childNodes[1].getElementsByTagName("tr");
        for (let i = 1; i < csvRows.length; i++) {
            let csvRow = csvRows[i];
            let csvColumns = csvRow.split('\t');
            let name = csvColumns[0].replace(/ <.*>/g, "");
            let nameComponents = name.split(' ');
            // Surname is always last, so start by checking there.
            let surname = nameComponents[nameComponents.length - 1];
            processStudentTableRows(tableRows, surname, nameComponents);
        }
    }

    /**
     * Check each student row for a name match, and mark the student as present should a match occur.
     * @param {HTMLElement[]} tableRows The HTML rows of the table.
     * @param {String} surname The surname of the student that is being searched for
     * @param {String[]} nameComponents An array of all name components
     */
    function processStudentTableRows(tableRows, surname, nameComponents) {
        // Start iterating the rows from two, as 1st row is hidden, 2nd is title
        // Len -1 as column is empty
        for (let i = 2; i < tableRows.length - 1; i++) {
            let tableRow = tableRows[i].children;
            let surnameInRow = tableRow[1].innerText.replace(/^\s+|\s+$/g, '');
            let firstnameInRow = tableRow[2].innerText.replace(/^\s+|\s+$/g, '');
            if (surnameInRow === surname) {
                let firstnameToCompare = nameComponents[0];
                // Grab initials from surname
                for (let nameCount = 1; nameCount < nameComponents.length - 1; nameCount++) {
                    firstnameToCompare += " " + nameComponents[nameCount].substr(0, 1);
                }
                if (firstnameInRow === firstnameToCompare) {
                    // Set option to okay
                    let selectBox = tableRow[tableRow.length - 1].children[0];
                    selectBox.selectedIndex = PRESENT_INDEX;
                }
            }
        }
    }

    /*
        Assign parseCsvToSam when a message is sent to this tab.
    */
    browser.runtime.onMessage.addListener(parseCsvToSam);
})();