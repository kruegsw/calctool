class SystemConditionVelocity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemConditionVelocity");

        this.units.quantity = "velocity";

        this.methods = {
            volumeRateOverArea: {
                label: "Volumetric Flow / Area",
                input: ["systemConditionFlowVolumeRate", "systemPropertyPipeCrossSectionalArea"],
                source: "",
                get calculation() {
                    let area = parent.convertSpecifyUnits("systemPropertyPipeCrossSectionalArea", "m^2");
                    let flowVolumeRate = parent.convertSpecifyUnits("systemConditionFlowVolumeRate", "m^3/s");
                    return parent.convertToLocalUnits("systemConditionVelocity", flowVolumeRate / area, "m/s");
                },
            }
        };
    }
}


/*
        this.systemConditionVelocity = {user: "", units: {value: "m/s", quantity: "velocity"}, method: "volumeRateOverArea", label: "Velocity",
            methods: {
                volumeRateOverArea: {
                    label: "Volumetric Flow / Area",
                    input: ["systemConditionFlowVolumeRate", "systemPropertyPipeCrossSectionalArea"],
                    source: "",
                    get calculation() {
                        let area = eval(this.instance).convertSpecifyUnits("systemPropertyPipeCrossSectionalArea", "m^2");
                        let flowVolumeRate = eval(this.instance).convertSpecifyUnits("systemConditionFlowVolumeRate", "m^3/s");
                        return eval(this.instance).convertToLocalUnits(this.property, flowVolumeRate / area, "m/s");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/