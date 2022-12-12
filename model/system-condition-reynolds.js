class SystemConditionReynolds extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemConditionReynolds");

        this.units.quantity = "";

        this.methods = {
            craneTPU410: {
                label: "Crane Technical Paper 410 Equation 3-3", // CRANE TP410 Equation 3-3:  Re = 6.31 * W [lb/hr] / d [in] / visc [cP]
                input: ["systemConditionFlowMassRate", "systemPropertyPipeInnerDiameter", "chemicalConditionViscosity"],
                source: SOURCES.moody,
                get calculation() {
                    let massFlow = parent.convertSpecifyUnits("systemConditionFlowMassRate", "lb/hr");
                    let diameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "in");
                    let viscosity = parent.convertSpecifyUnits("chemicalConditionViscosity", "centipoise");
                    return 6.31*massFlow/diameter/viscosity;
                },
            }
        };
    }
}

/*
        this.systemConditionReynolds = {user: "", units: {value: "", quantity: ""}, method: "craneTPU410", label: "Reynolds Number",
            methods: {
                craneTPU410: {
                    label: "Crane Technical Paper 410 Equation 3-3", // CRANE TP410 Equation 3-3:  Re = 6.31 * W [lb/hr] / d [in] / visc [cP]
                    input: ["systemConditionFlowMassRate", "systemPropertyPipeInnerDiameter", "chemicalConditionViscosity"],
                    source: SOURCES.moody,
                    get calculation() {
                        let massFlow = eval(this.instance).convertSpecifyUnits("systemConditionFlowMassRate", "lb/hr");
                        let diameter = eval(this.instance).convertSpecifyUnits("systemPropertyPipeInnerDiameter", "in");
                        let viscosity = eval(this.instance).convertSpecifyUnits("chemicalConditionViscosity", "centipoise");
                        return 6.31*massFlow/diameter/viscosity;
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/