class SystemPropertyPipeCrossSectionalArea extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeCrossSectionalArea");

        this.units.quantity = "area";

        this.methods = {
            calculatefromDiameter: {
                label: "Calculate from Diameter",
                input: ["systemPropertyPipeInnerDiameter"],
                source: "",
                get calculation() {
                    let diameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "meter");
                    return parent.convertToLocalUnits("systemPropertyPipeCrossSectionalArea", Math.PI * Math.pow(diameter,2) / 4, "m2");
                },
            }
        };
    }
}


/*
        this.systemPropertyPipeCrossSectionalArea = {user: "", units: {value: "ft^2", quantity: "area"}, method: "calculatefromDiameter", label: "Pipe Cross Section Area",
            methods: {
                calculatefromDiameter: {
                    label: "Calculate from Diameter",
                    input: ["systemPropertyPipeInnerDiameter"],
                    source: "",
                    get calculation() {
                        let diameter = eval(this.instance).convertSpecifyUnits("systemPropertyPipeInnerDiameter", "meter");
                        return eval(this.instance).convertToLocalUnits(this.property, Math.PI * Math.pow(diameter,2) / 4, "m^2");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/