

/*
function eventListenerTest() {
    document.addEventListener("change", (e) => {
        let instanceProperty = e.target.name; // e.g. "systemPropertyPipeNominalDiameter"
        switch (instanceProperty) {
            case "systemPropertyPipeStandard":
                let htmlElement = document.getElementById("systemPropertyPipeNominalDiameter.user"); 
                let oldDiameter = htmlElement.value; // Caputre old diameter value for future use
                let dropDownArray = arrayOfPipeNominalDiameter(this.systemPropertyPipeStandard.value); // array of nominal diameters for selected standard
                console.log(dropDownArray.map((e, i) => [Math.abs(oldDiameter-e), i]).sort()[0]);
                htmlElement.innerHTML = convertArrayToOptionsHTML(dropDownArray, "");
                htmlElement.value = "50";
                this.systemPropertyPipeNominalDiameter.user = "50";
                break;
            default:
                console.log("default switch");
        }
    })

}
*/