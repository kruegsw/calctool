function convertArrayToOptionsHTML(dropDownArray, valueAttr) {
    let dropDownListHTML = "";
    for (let i = 0; i < dropDownArray.length; i++) {

        if (dropDownArray[i] === "") {continue}; // remove empty strings ""

        let insertedSelectedIfSelected = dropDownArray[i] === valueAttr ? " selected" : ""; 

        dropDownListHTML += "<option value=\"" + dropDownArray[i] + "\"" + insertedSelectedIfSelected + ">" + dropDownArray[i] + "</option>";

    }
    return dropDownListHTML;
}

function createAndInsertBasicTable(dataObject, destinationID) {

    let [dataArray, captionText] = prepareBasicTableData(dataObject);

    let table = buildBasicTableHTML(dataArray, captionText);

    document.getElementById(destinationID).appendChild(table);
}

function prepareBasicTableData(dataObject) {

    let dataArray =  Object.entries(dataObject);
    dataArray.unshift(['Parameter','Value']); /* add heading */

    let captionText = "This is a caption."; /* this is manual for now */

    return [dataArray, captionText];

}

function buildBasicTableHTML(dataArray, captionText) {

    /*
     ______________________________________
    | headArr[0] | headArr[2] | headArr[j] |
    |____________|____________|____________|
    | arr[0][0]  | arr[0][1]  | arr[0][j]  |
    |____________|____ _______|____ _______|
    | arr[1][0]  | arr[1][1]  | arr[1][j]  |
    |____________|____________|____________|
    | arr[i][0]  | arr[i][1]  | arr[i][j]  |

    */

    let headerArray = dataArray.shift(); /* dataArray first element is removed and saved as variable headingArray */
   
    let newTable = document.createElement("table");

        let caption_1 = document.createElement("caption");
        caption_1.innerHTML = captionText;
        newTable.appendChild(caption_1);

        let trHead = document.createElement("tr");
        for (let heading of headerArray) {
            let tdNew = document.createElement("td");
            tdNew.innerHTML = heading;
            trHead.appendChild(tdNew);
        }

        thead_1 = document.createElement("thead");
        thead_1.appendChild(trHead);

        newTable.appendChild(thead_1);

        let tbody = document.createElement("tbody");
        for (let row of dataArray) {
            let trBody = document.createElement("tr");
            for (let column of row) {
                let tdNew = document.createElement("td");
                tdNew.innerHTML = column;
                trBody.appendChild(tdNew);
            }
            tbody.appendChild(trBody);
        }
    newTable.appendChild(tbody);
    return newTable;

}

function createAndInsertFlowTable(dataObject, destinationID, columns, captionText = "", tableClass = "") {

    let dataArray = dataObject.flowInstanceArrayForTable(columns); // data for table comes from another JS file

    /*
     ______________________________________
    | headArr[0] | headArr[2] | headArr[3] |
    |            |            |            |
    |            |            |            |
    |____________|____________|____________|
    | arr[0][0]  |HTML element|HTML element|
    |            | funct(arr) | funct(arr) |
    |            |id=arr[0][0]| function() |
    |____________|____________|____________|
    | arr[1][0]  |HTML element|HTML element|
    |            | funct(arr) | funct(arr) |
    |            |id=arr[1][0]| id=funct() |
    |____________|____________|____________|
    | arr[i][0]  |HTML element|HTML element|
    |            | funct(arr) | funct(arr) |
    |            |id=arr[i][0]| id=funct() |

    */

    let headerArray = dataArray.shift(); /* dataArray first element is removed and saved as variable headingArray */
   
    let newTable = document.createElement("table");

        let caption_1 = document.createElement("caption");
        caption_1.innerHTML = captionText;
        newTable.appendChild(caption_1);

        let trHead = document.createElement("tr");
        for (let heading of headerArray) {
            let tdNew = document.createElement("td");
            tdNew.innerHTML = heading;
            trHead.appendChild(tdNew);
        }

        thead_1 = document.createElement("thead");
        thead_1.appendChild(trHead);

        newTable.appendChild(thead_1);

        let tbody = document.createElement("tbody");
        for (let row of dataArray) {
            let trBody = document.createElement("tr");
            for (let column of row) { 
                let tdNew = document.createElement("td");
                tdNew.innerHTML = column;                 
                trBody.appendChild(tdNew);
            }
            tbody.appendChild(trBody);
        }
    newTable.appendChild(tbody);

    newTable.setAttribute("class", tableClass);
    
    document.getElementById(destinationID).appendChild(newTable);

}

function buildOutputHTML(forAttrArray, idAttr, nameAttr, valueAttr) {
    //console.log(`${forAttrArray} ${nameAttr} ${idAttr}`)
    let htmlOutputText = "<output for=\""+ forAttrArray.join(" ") +
        "\" id=\"" + idAttr +
        "\" name=\"" + nameAttr +
        "\" value=\"" + valueAttr +
        "\">";
    return htmlOutputText;
}

function buildInputTextHTML(typeAttr, idAttr, nameAttr, valueAttr) {
    let htmlInputText = "<input type=\""+ typeAttr +
        "\" id=\"" + idAttr +
        "\" name=\"" + nameAttr +
        "\" value=\"" + valueAttr +
        "\">";
    return htmlInputText;
}

function buildSelectHTML(idAttr, nameAttr, valueAttr, dropDownArray) {

    /*
    console.log("typeAttr = ");
    console.log(typeAttr);
    console.log("nameAttr = ");
    console.log(nameAttr);
    console.log("idAttr = ");
    console.log(idAttr);
    console.log("valueAttr = ");
    console.log(valueAttr);
    console.log("onChangeAttr = ");
    console.log(onChangeAttr);
    console.log("dropDownArray = ");
    console.log(dropDownArray);
    */

    //populateDropList(PROPERTIES.map((element, index, array) => {return element.searchTerm}), idAttr);

    let dropDownListHTML = convertArrayToOptionsHTML(dropDownArray, valueAttr);

    let htmlSelectList = "<select"+
    " id=\"" + idAttr +
    "\" name=\"" + nameAttr +
    "\" value=\"" + valueAttr +
    "\">" + dropDownListHTML + "</select>";

    return htmlSelectList;
}

function buildInputDataListHTML(typeAttr, dataListID, idAttr, nameAttr, valueAttr, dropDownArray) {

    //populateDropList(PROPERTIES.map((element, index, array) => {return element.searchTerm}), idAttr);
    //console.log(dropDownArray);

    let dropDownListHTML = convertArrayToOptionsHTML(dropDownArray, valueAttr);

    let htmlInputText = "<input type=\"" + typeAttr +
        "\" list=\"" + dataListID +
        "\" id=\"" + idAttr +
        "\" name=\"" + nameAttr +
        "\" value=\"" + valueAttr +
        "\" autocomplete=\"off\">" +
        "<datalist id=\"" + dataListID + "\">" +
        dropDownListHTML +
        "</datalist>";

    return htmlInputText;

}

function setNumberFormat(number) {
    //document.getElementsByName(`${element}.user`)[0].placeholder = this[element].calculation

    formattedNumber = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 }).format(number);
    return formattedNumber;

}

/*
function populateDOMDropList (dropDownArray, selectName) {
    console.log("populateDropList(dropDownArraym selectName) called.");
    console.log("selectName is " + selectName);
    let select = document.getElementsByName(selectName);
    console.log("select = document.getElementByName(selectName) is:");
    console.log(select);
    console.log("select.length is");
    console.log(select.length);
    console.log("select.innerHTML is " + select.innerHTML);
    select.innerHTML = "";
    console.log("sselect.innerHTML is " + select.innerHTML);
    let options = dropDownArray;
    console.log("options = dropDownArray is:");
    console.log(dropDownArray);

    for (let i = 0; i < options.length; i++) {
        select.innerHTML += "<option value=\"" + options[i] + "\">" + options[i] + "</option>";
    }
    console.log("after the for() loop is called, select is:");
    console.log(select);
}
*/

/*
function populateDropDownLists() {
    populateTagDropList(Object.keys(PIPE_MATERIAL), 'pipeMaterial');
    populateTagDropList(PROPERTIES.map((element, index, array) => {return element.searchTerm}), 'chemicalOptions');
}
*/