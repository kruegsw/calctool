class SystemConditionFlowVolumeRate extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemConditionFlowVolumeRate");

        this.units.quantity = "volumeRate";

        this.methods = {
            "massRate/density": {
                label: "mass rate divided by density",
                input: ["systemConditionFlowMassRate", "chemicalConditionDensity"],
                source: "",
                get calculation() {
                    let massFlow = parent.convertSpecifyUnits("systemConditionFlowMassRate", "kg/hr");
                    let density = parent.convertSpecifyUnits("chemicalConditionDensity", "kg/m3");
                    return parent.convertToLocalUnits("systemConditionFlowVolumeRate", massFlow / density, "m3/h");
                },
            }
        };
    }
}


/*
        this.systemConditionFlowVolumeRate = {user: "", units: {value: "ft^3/h", quantity: "volumeRate"}, method: "massRate/density", label: "Volume Flow Rate",
            methods: {
                "massRate/density": {
                    label: "mass rate divided by density",
                    input: ["systemConditionFlowMassRate", "chemicalConditionDensity"],
                    source: "",
                    get calculation() {
                        let massFlow = eval(this.instance).convertSpecifyUnits("systemConditionFlowMassRate", "kg/hr");
                        let density = eval(this.instance).convertSpecifyUnits("chemicalConditionDensity", "kg/m3");
                        return eval(this.instance).convertToLocalUnits(this.property, massFlow / density, "m^3/h");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/