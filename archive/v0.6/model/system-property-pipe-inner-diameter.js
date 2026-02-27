class SystemPropertyPipeInnerDiameter extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeInnerDiameter");

        this.units.quantity = "length";

        this.methods = {
            "fromPipeInfo": {
                label: "Inner Diameter of Selected Pipe",
                input: ["systemPropertyPipeStandard", "systemPropertyPipeNominalDiameter", "systemPropertyPipeSchedule"],
                source: "",
                get calculation() {
                    let pipeThickness = pipeWallThickness(parent.systemPropertyPipeStandard.value, parent.systemPropertyPipeNominalDiameter.value, parent.systemPropertyPipeSchedule.value);
                    let pipeOD = pipeOuterDiameter(parent.systemPropertyPipeStandard.value, parent.systemPropertyPipeNominalDiameter.value);
                    return parent.convertToLocalUnits("systemPropertyPipeInnerDiameter", pipeOD - (2 * pipeThickness), parent.systemPropertyPipeNominalDiameter.units.value)
                },
            },
            "d=4*Rh": {
                label: "equivalent diameter",
                input: ["systemPropertyPipeHydraulicRadius"],
                source: "crane",
                get calculation() {
                    let hydraulicRadiusInMeters = parent.convertSpecifyUnits("systemPropertyPipeHydraulicRadius", "meter");
                    return parent.convertToLocalUnits("systemPropertyPipeInnerDiameter", 4*hydraulicRadiusInMeters, "meter");
                },
            },
            "fromArea": {
                label: "Inner Diameter Calculated from User Specified Cross Sectional Area",
                input: ["systemPropertyPipeCrossSectionalArea"],
                source: "",
                get calculation() {
                    let crossSectionAreaInMeters = parent.convertSpecifyUnits("systemPropertyPipeCrossSectionalArea", "m^2");
                    let innerDiameterInMetersSquared = Math.pow(crossSectionAreaInMeters * 4 / Math.PI, 0.5);
                    return parent.convertToLocalUnits("systemPropertyPipeInnerDiameter", innerDiameterInMetersSquared, "meter");
                },
            }
        };
    }
}


/*
        this.systemPropertyPipeInnerDiameter = {user: "", units: {value: "in", quantity: "length"}, method: "fromPipeInfo", label: "Inner Diameter",
            methods: {
                "fromPipeInfo": {
                    label: "Inner Diameter of Selected Pipe",
                    input: ["systemPropertyPipeStandard", "systemPropertyPipeNominalDiameter", "systemPropertyPipeSchedule"],
                    source: "",
                    get calculation() {
                        let pipeThickness = pipeWallThickness(eval(this.instance).systemPropertyPipeStandard.value, eval(this.instance).systemPropertyPipeNominalDiameter.value, eval(this.instance).systemPropertyPipeSchedule.value);
                        let pipeOD = pipeOuterDiameter(eval(this.instance).systemPropertyPipeStandard.value, eval(this.instance).systemPropertyPipeNominalDiameter.value);
                        return eval(this.instance).convertToLocalUnits(this.property, pipeOD - (2 * pipeThickness), eval(this.instance).systemPropertyPipeNominalDiameter.units.value)
                    },
                },
                "d=4*Rh": {
                    label: "equivalent diameter",
                    input: ["systemPropertyPipeHydraulicRadius"],
                    source: "crane",
                    get calculation() {
                        let hydraulicRadiusInMeters = eval(this.instance).convertSpecifyUnits("systemPropertyPipeHydraulicRadius", "meter");
                        return eval(this.instance).convertToLocalUnits(this.property, 4*hydraulicRadiusInMeters, "meter");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/