class Flow {
    constructor(objectName) {

        this.objectName = objectName;

        //this.userDesignFactor
        //this.userMinVelocity 
        //this.userMaxVelocity
        //this.userMinPressure
        //this.userMaxPressure
        this.chemicalPropertyName = new ChemicalPropertyName (this, "Chemical", "air", "", "");
        this.chemicalPropertyCAS = new ChemicalPropertyCAS (this, "CAS Number", "", "", "lookup");
        this.chemicalPropertyMolecularWeight = new ChemicalPropertyMolecularWeight (this, "Molecular Weight", "", "", "lookup");
        this.chemicalPropertyCriticalPressure = new ChemicalPropertyCriticalPressure (this, "Critical Pressure", "", "psig", "");
        this.chemicalPropertyCriticalTemperature = new ChemicalPropertyCriticalTemperature (this, "Critical Temperature", "", "celsius", "");
        this.chemicalPropertyNormalBoilingTemperature = new ChemicalPropertyNormalBoilingTemperature (this, "Normal Boiling Point", "", "celsius", "");
        this.chemicalConditionTemperature = new ChemicalConditionTemperature (this, "Temperature", "", "celsius", "");
        this.chemicalConditionPressure = new ChemicalConditionPressure (this, "Pressure", "", "psig", "");
        this.chemicalConditionPhase = new ChemicalConditionPhase (this, "Phase", "", "", "");
        this.chemicalConditionVaporPressure = new ChemicalConditionVaporPressure (this, "Vapor Pressure", "", "psia", "");
        this.chemicalConditionSaturationPressure = new ChemicalConditionSaturationPressure (this, "Saturation Pressure", "", "psia", "");
        this.chemicalConditionDensity = new ChemicalConditionDensity (this, "Density", "", "lb/ft3", "idealGas");
        this.chemicalConditionViscosity = new ChemicalConditionViscosity(this, "Absolute (Dynamic) Viscosity", "", defaultUnits("viscosity"), "sutherland");       
        this.chemicalConditionCp = new ChemicalConditionCp (this, "Heat Capacity at Constant Pressure (Cp)", "", "BTU/lb/F", "");
        this.chemicalConditionCv = new ChemicalConditionCv (this, "Heat Capacity at Constant Volume (Cv)", "", "BTU/lb/F", "");
        this.chemicalConditionCpCvRatio = new ChemicalConditionCpCvRatio (this, "Heat Capacity Ratio Cp/Cv", "", "", "heatCapacityRatio");
        this.chemicalConditionSonicVelocity = new ChemicalConditionSonicVelocity (this, "Sonic Velocity", "", "m/s", "compressible gas");
        this.chemicalConditionStaticPressureOutInRatioForSonicVelocity = new ChemicalConditionStaticPressureOutInRatioForSonicVelocity (this, "Pressure Ratio for Sonic Velocity Po/Pi", "", "", "");
        this.systemPropertyPipeMaterial = new SystemPropertyPipeMaterial(this, "Pipe Material", "Commercial Steel or Wrought Iron", "", "");
        this.systemPropertyPipeStandard = new SystemPropertyPipeStandard(this, "Pipe Standard", "NPS", "", "");
        
        this.systemPropertyPipeAbsoluteRoughness = new SystemPropertyPipeAbsoluteRoughness(this, "Absolute Roughness", "", "ft", "empirical");
        this.systemPropertyPipeModulusElasticity = new SystemPropertyPipeModulusElasticity(this, "Modulus of Elasticity", "", "", "");
        this.systemPropertyPipeNominalDiameter = new SystemPropertyPipeNominalDiameter(this, "Nominal Diameter", "2", "in", "");
        this.systemPropertyPipeInnerDiameter = new SystemPropertyPipeInnerDiameter(this, "Inner Diameter", "", "in", "fromPipeInfo");
        this.systemPropertyPipeSchedule = new SystemPropertyPipeSchedule(this, "Pipe Schedule", "Sch. 40", "", "");
        this.systemPropertyPipeHydraulicRadius = new SystemPropertyPipeHydraulicRadius(this, "Hydraulic Radius", "", "in", "");
        this.systemPropertyPipeCrossSectionalArea = new SystemPropertyPipeCrossSectionalArea(this, "Pipe Cross Section Area", "", "in^2", "calculatefromDiameter");
        this.systemPropertyPipeLength = new SystemPropertyPipeLength(this, "Pipe Length", "100", "ft", "");
        //this.systemPropertyAdditionalK
        //this.systemPropertyAdditionalCv
        this.systemConditionFlowMassRate = new SystemConditionFlowMassRate(this, "Mass Flow Rate", "100", "lb/hr", "");
        this.systemConditionFlowVolumeRate = new SystemConditionFlowVolumeRate(this, "Volume Flow Rate", "", "ft^3/h", "massRate/density");
        this.systemConditionReynolds = new SystemConditionReynolds(this, "Reynolds Number", "", "", "craneTPU410");
        this.systemConditionFrictionFactor = new SystemConditionFrictionFactor(this, "Friction Factor", "", "", "colebrooke");
        this.systemConditionVelocity = new SystemConditionVelocity(this, "Velocity", "", "m/s", "volumeRateOverArea");
        //this.systemConditionPressureDropTotal = new SystemConditionPressureDropTotal (this, "Total Pressure Drop", "", "psi", "");
        //this.systemConditionPressureStaticIn
        //this.systemConditionPressureStaticOut
        //this.systemConditionPressureStaticOutInRatio
        this.systemConditionPressureDropPipe = new SystemConditionPressureDropPipe (this, "Pressure Drop (Pipe Only)", "", "psi", "darcy");
        //this.systemConditionPressureDropAdditionalK
        //this.systemConditionPressureDropAdditionalCv
        
    };

    // ============================================================================
    // =====================  user initiated update  ==============================
    // ============================================================================

    
    eventHandler() {
        document.addEventListener("change", (e) => {
            let htmlElementThis = document.getElementById(e.target.attributes.id.value);

            //console.log(e);
            //console.log(htmlElementThis);
            this.inputOutputConflict(htmlElementThis);
            this.updatePreferences(htmlElementThis);
            this.updateInstance(htmlElementThis);
            this.updateHTML();
            console.log(this);
        })

        document.addEventListener("mouseover", (e) => {
            if (!e.target.attributes.id) {return}
            let htmlElementThis = document.getElementById(e.target.attributes.id.value);

            this.mouseOver(htmlElementThis);
            }

        )

        document.addEventListener("mouseout", (e) => {
            if (!e.target.attributes.id) {return}
            let htmlElementThis = document.getElementById(e.target.attributes.id.value);

            this.mouseOut(htmlElementThis);
            }

        )
    
    }

    mouseOver(htmlElementThis) {
        let [inputsOf, outputsOf] = this.determineDependencies();
        
        let inputNamesArray = inputsOf[htmlElementThis.name];
        let outputNamesArray = outputsOf[htmlElementThis.name];


        if (inputNamesArray) {
            for (let inputName of inputNamesArray) {
                document.getElementById(inputName+".user.value").classList.add('inputs-hover');
            }
        }

        htmlElementThis.classList.add('target-hover');

        if (outputNamesArray) {
            for (let outputName of outputNamesArray) {
                document.getElementById(outputName+".user.value").classList.add('outputs-hover');
            }
        }
    }

    mouseOut(htmlElementThis) { // this needs work, the mouseOut doesn't work if the input is changed while being mouseOver'd
        
        let [inputsOf, outputsOf] = this.determineDependencies();
        
        let inputNamesArray = inputsOf[htmlElementThis.name];
        let outputNamesArray = outputsOf[htmlElementThis.name];

        if (inputNamesArray) {
            for (let inputName of inputNamesArray) {
                document.getElementById(inputName+".user.value").classList.remove('inputs-hover');
            }
        }

        htmlElementThis.classList.remove('target-hover');

        if (outputNamesArray) {
            for (let outputName of outputNamesArray) {
                document.getElementById(outputName+".user.value").classList.remove('outputs-hover');
            }
        }
    }


    updatePreferences(htmlElementThis) {
        switch (htmlElementThis.name) {
            case "systemPropertyPipeStandard":
                console.log("inside case");
                if (htmlElementThis.id === "systemPropertyPipeStandard.user.value" || "systemPropertyPipeNominalDiameter.user.value") {this.implementPipingStandardPreferences(htmlElementThis)};
                break;
            default:
                console.log("default switch");
        }
    }

    updateInstance(htmlElementThis) {  // because the updateInstance() function is defined in buildHTML.js the text "this" to which 'htmlFormThis' points is the html element where it is called
    
        let arrayHtmlIdParced = htmlElementThis.id.split(".");
        
        switch(arrayHtmlIdParced.length) {
            case 2: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] = htmlElementThis.value;
            case 3: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] = htmlElementThis.value;
            case 4: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] = htmlElementThis.value;
            default: return console.log("updateInstance() did not update anything");
        }

    }

    // ============================================================================
    // =========================  dependencies  ===================================
    // ============================================================================

    determineDependencies() { // pairing inputs with the calculated, and the calculate with the inputs
        
        let inputsOf = {}; // inputsOf[instanceProperty] === [... these are the inputs to this instanceProperty ...]
        let outputsOf = {}; // outputsOf[instanceProperty] === [... these are the outputs of this instanceProperty ...]

        for (let instanceProperty of Object.keys(this)) {

            if (this[instanceProperty].method && this[instanceProperty].method.value) { // if a 'method.value' is selected (which will result in a 'calculation') and thus a default value for 'value')
                // this.object name throws an error for "this[instanceProperty].method.value" so added ""this[instanceProperty].method" as well

                //let inputArray = this[instanceProperty].methods[this[instanceProperty].method.value].input; // inputArray = [... inputs required to calculate method...]
                let inputArray = this[instanceProperty].input;
                inputsOf[instanceProperty] = inputArray; // inputsOf <-- {instanceProperty : inputArray}
                
                for (let input of inputArray) {
                    outputsOf[input] ?
                        outputsOf[input].push(instanceProperty) : // create input as key with value if it doesn't already exist, but if it does exist then
                        outputsOf[input] = [instanceProperty] // outputsOf[input] === [... calculations which require this method...] <-- instanceProperty
                };
            }    
        }
        //console.log([inputsOf, outputsOf]);
        return [inputsOf, outputsOf];
    }

    // ============================================================================
    // ==========================  view hover  ====================================
    // ============================================================================

    // ============================================================================
    // ==========================  view table  ====================================
    // ============================================================================

    flowInstanceArrayForTable(columns) {
        let rows = Object.keys(this);
        //let columns = ["label", "user", "calculation", "value", "units", "method"];
        rows.shift(); // remove objectName off position [0]
        let flowInstanceArray = rows.map((row, index, array) => {
            return (
                columns.map((column, index, array) => {
                    return this[row][column].html ?
                        this[row][column].html.value :
                        this.outputHTML(row + "." + column)})
            )
        });   
        flowInstanceArray.unshift(columns); // add heading
        return flowInstanceArray;
    }

    updateHTML() {
        let [inputsOf, outputsOf] = this.determineDependencies();
        for (let instanceProperty of Object.keys(this).slice(1)) {
            // temporary for troubleshooting only to populate the 'value' box
            
            document.getElementById(instanceProperty + ".calculation") ? document.getElementById(instanceProperty + ".calculation").value = this[instanceProperty].calculation : ""; 
            document.getElementById(instanceProperty + ".value") ? document.getElementById(instanceProperty + ".value").value = this[instanceProperty].value : "";
            
            document.getElementById(instanceProperty + ".units.value").value = this[instanceProperty].units.value; // this only necessary for the getter systemPipeNominalDiameter

            // end temporary code

            //document.getElementsByName(`${element}.user`)[0].placeholder = this[element].calculation; // if empty, the 'user' text box shows the current 'value'
            document.getElementById(`${instanceProperty}.user.value`).placeholder = // the placeholder for the '.user' input will show calculated value if no user input
                this[instanceProperty].calculation ?
                    (+(this[instanceProperty].calculation) ? setNumberFormat(this[instanceProperty].calculation) : this[instanceProperty].calculation)
                    : "";
                
            // Mark Fields as required or optional
            if (outputsOf[instanceProperty]) { // if property is used in another property's calculation then required, otherwise optional
                document.getElementById(instanceProperty + ".user.value").required = true;
                document.getElementById(instanceProperty + ".user.value").optional = false;
            } else {
                document.getElementById(instanceProperty + ".user.value").required = false;
                document.getElementById(instanceProperty + ".user.value").optional = true;
            }
        }

    }

    // ============================================================================
    // ===========================  UNITS.JS  =====================================
    // ============================================================================

    convertSpecifyUnits(property, newUnits) {
        return convertUnits(this[property].units.quantity, this[property].value, this[property].units.value, newUnits);
    }

    convertToLocalUnits(property, value, oldUnits) { // passing "this.property" from within the property (e.g. chemicalPropertyTemperature) will results in the property name e.g. "chemicalPropertyTemperature" 
        return convertUnits(this[property].units.quantity, value, oldUnits, this[property].units.value);
    }
    // ============================================================================
    // =========================  buildHTML.JS  ===================================
    // ============================================================================ 

    dataListHTML(instancePropertyIdString, dropDownArray) {

        let arrayHtmlIdParced = instancePropertyIdString.split(".");
        let instanceProperty = arrayHtmlIdParced[0];

        return buildInputDataListHTML(
            "search", // type
            instanceProperty + "DataList", // datalist id
            instancePropertyIdString, // id
            instanceProperty, // name
            (() => {
                switch(arrayHtmlIdParced.length) {
                    case 2: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] : "";
                    case 3: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] : "";
                    case 4: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] : "";
                    default: console.log("updateInstance() did not update anything");
                }
            })(), // value
            dropDownArray); // dropDownArray
    }

    selectHTML(instancePropertyIdString, dropDownArray) {

        let arrayHtmlIdParced = instancePropertyIdString.split(".");
        let instanceProperty = arrayHtmlIdParced[0];

        return buildSelectHTML(
            instancePropertyIdString, // id
            instanceProperty, // name
            (() => {
                switch(arrayHtmlIdParced.length) {
                    case 2: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] : "";
                    case 3: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] : "";
                    case 4: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] : "";
                    default: console.log("updateInstance() did not update anything");
                }
            })(), // value
            dropDownArray // dropDownArray
        );
    }

    inputHTML(instancePropertyIdString, dropDownArray) {

        let arrayHtmlIdParced = instancePropertyIdString.split(".");
        let instanceProperty = arrayHtmlIdParced[0];


        return buildInputTextHTML(
            "text", // type
            instancePropertyIdString, // id
            instanceProperty, // name
            (() => {
                switch(arrayHtmlIdParced.length) {
                    case 2: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] : "";
                    case 3: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] : "";
                    case 4: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] : "";
                    default: console.log("updateInstance() did not update anything");
                }
            })(), // value
        )
    }

    outputHTML(instancePropertyIdString) {

        let arrayHtmlIdParced = instancePropertyIdString.split(".");
        let instanceProperty = arrayHtmlIdParced[0];

        return buildOutputHTML(
            this[instanceProperty].input ? this[instanceProperty].input : [],  // for
            instancePropertyIdString, // id
            instanceProperty, // name
            (() => {
                switch(arrayHtmlIdParced.length) {
                    case 2: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]] : "";
                    case 3: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]] : "";
                    case 4: return this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] ? this[arrayHtmlIdParced[0]][arrayHtmlIdParced[1]][arrayHtmlIdParced[2]][arrayHtmlIdParced[3]] : "";
                    default: console.log("updateInstance() did not update anything");
                }
            })(), // value
        );
    }

    // ============================================================================
    // ========================    preferences    =================================
    // ============================================================================
    

    implementPreference(instancePoperty, userValue, userDropDownArray, unitsValue, unitsDropDownArray, methodValue) {
        if(userValue) {
            this[instancePoperty].user.value = userValue;
            document.getElementById(instancePoperty + ".user.value").value = userValue;
        };
        if(userDropDownArray) {document.getElementById(instancePoperty + ".user.value").innerHTML = convertArrayToOptionsHTML(userDropDownArray, userValue)};
        if(unitsValue) {
            this[instancePoperty].units.value = unitsValue;
            document.getElementById(instancePoperty + ".units.value").value = unitsValue;
        };
        if(unitsDropDownArray) {document.getElementById(instancePoperty + ".units.value").innerHTML = convertArrayToOptionsHTML(unitsDropDownArray, unitsValue)};
        if(methodValue) {this[instancePoperty].method.value = methodValue};
    };

    implementPipingStandardPreferences(htmlElementThis) {
        if (htmlElementThis.value === "NPS") {
            this.implementPreference("systemPropertyPipeNominalDiameter", "2", arrayOfPipeNominalDiameter(htmlElementThis.value), "in", "", "");
            this.implementPreference("systemPropertyPipeSchedule", "Sch. 40", arrayOfPipeSchedule(htmlElementThis.value, "2"), "", "", "");
            this.implementPreference("systemPropertyPipeInnerDiameter", "", "", "in", "", "");  
        };
        if (htmlElementThis.value === "DN") {
            this.implementPreference("systemPropertyPipeNominalDiameter", "50", arrayOfPipeNominalDiameter(htmlElementThis.value), "mm", "", "");
            this.implementPreference("systemPropertyPipeSchedule", "Sch. 40", arrayOfPipeSchedule(htmlElementThis.value, "50"), "", "", "");
            this.implementPreference("systemPropertyPipeInnerDiameter", "", "", "mm", "", "");
        };
        if (htmlElementThis.value === "CTS") {
            this.implementPreference("systemPropertyPipeNominalDiameter", "3/4", arrayOfPipeNominalDiameter(htmlElementThis.value), "in", "", "");
            this.implementPreference("systemPropertyPipeSchedule", "Type L", arrayOfPipeSchedule(htmlElementThis.value, "3/4"), "", "", "");
            this.implementPreference("systemPropertyPipeInnerDiameter", "", "", "in", "", "");
        };
        if (htmlElementThis.value === "ACR") {
            this.implementPreference("systemPropertyPipeNominalDiameter", "5/8", arrayOfPipeNominalDiameter(htmlElementThis.value), "in", "", "");
            this.implementPreference("systemPropertyPipeSchedule", "Type D", arrayOfPipeSchedule(htmlElementThis.value, "5/8"), "", "", "");
            this.implementPreference("systemPropertyPipeInnerDiameter", "", "", "in", "", "");
        };
        if (htmlElementThis.id === "systemPropertyPipeNominalDiameter.user.value") { // update schedule drop down and value if the nom diameter is changed
            this.implementPreference("systemPropertyPipeSchedule", document.getElementById("systemPropertyPipeSchedule.user.value").value, arrayOfPipeSchedule(this.systemPropertyPipeStandard.user.value, htmlElementThis.value), "", "", ""); // instance to assumes default value of html form
        };
    }

    
    inputOutputConflict(htmlElementThis) {
               
        /*
        let [inputsOf, outputsOf] = this.determineDependencies();
        let changedInstanceProperty = htmlElementThis.name;
        console.log(changedInstanceProperty);

        //if (!inputsOf[changedInstanceProperty] || !outputsOf[changedInstanceProperty]) {return}

        for (let output of outputsOf[changedInstanceProperty]) {
            //console.log(output);
            console.log(outputsOf[changedInstanceProperty]);
            console.log(inputsOf[output]);
            console.log([inputsOf[output]].includes(changedInstanceProperty));
            if ( inputsOf[output].includes(changedInstanceProperty) ) {
                console.log("inside the loop");
                console.log(output);
                this.implementPreference(output, this[output].value, "", "", "", "");
            };
        }
        */
    }

    // ============================================================================
    // ===========================    END     =====================================
    // ============================================================================


}


