class FlowModelTemplate {
    constructor(parent, labelValue, userValue, unitsValue, methodValue, instanceProperty)
    {
        this.parent =  parent.objectName;

        this.instanceProperty = instanceProperty;

        this.label = {
            value: labelValue,
            html: {
                get default() {return `<label for='${instanceProperty}'>${parent[instanceProperty].label.value}</label>`},
                override: "",
                get value() {return this.override ? this.override : this.default},
            },
        };
        this.user = {
            value: userValue,
            html: {
                optionsArray: "",
                get default() {return parent.inputHTML(instanceProperty + ".user.value")},
                override: "",
                get value() {return this.override ? this.override : this.default}
            },
        };
        this.units = {
            value: unitsValue,
            quantity: "",                               // units.quantity is determined by child
            html: {
                optionsArray: "",
                get default() {return parent.selectHTML(instanceProperty + ".units.value", unitsArrayForTable(parent[instanceProperty].units.quantity)[0], unitsArrayForTable(parent[instanceProperty].units.quantity)[1])},
                override: "",
                get value() {return this.override ? this.override : this.default}
            },
        };
        this.method = {
            user: methodValue,
            html: {
                optionsArray: "",
                get default() {return parent.selectHTML(instanceProperty + ".method.user", parent[instanceProperty].methods ? Object.keys(parent[instanceProperty].methods) : "" )},
                override: "",
                get value() {return this.override ? this.override : this.default}
            },
            get calculation() {return ""},
            get value() {return this.user ? this.user : this.calculation},
        };


        this.methods = {};                              // methods declared by child
        //this.events = {};                             // events declared by child

    }
    get input() {return this.method.value && !this.user.value ? this.methods[this.method.value].input : ""}; // inputs for the current method selected
    get calculation() {return this.method.value ? this.methods[this.method.value].calculation : ""};
    get value() {return this.user.value ? this.user.value : this.calculation};


    /*
    implementPreference(instancePoperty, userValue, userDropDownArray, unitsValue, unitsDropDownArray, methodValue) {
        if(userValue) {
            parent[instancePoperty].user = userValue;
            document.getElementById(instancePoperty + ".user").value = userValue;
        };
        if(userDropDownArray) {document.getElementById(instancePoperty + ".user").innerHTML = convertArrayToOptionsHTML(userDropDownArray, userValue)};
        if(unitsValue) {
            parent[instancePoperty].units.value = unitsValue;
            document.getElementById(instancePoperty + ".units.value").value = unitsValue;
        };
        if(unitsDropDownArray) {document.getElementById(instancePoperty + ".units.value").innerHTML = convertArrayToOptionsHTML(unitsDropDownArray, unitsValue)};
        if(methodValue) {parent[instancePoperty].method = methodValue};
    };
    */
}
