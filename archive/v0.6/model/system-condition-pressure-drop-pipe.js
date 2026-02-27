class SystemConditionPressureDropPipe extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemConditionPressureDropPipe");

        this.units.quantity = "pressureDifference";

        this.methods = {
            darcy: {
                label: "Darcy Equations",
                input: ["systemConditionFrictionFactor", "chemicalConditionDensity", "systemPropertyPipeLength", "systemPropertyPipeInnerDiameter", "systemConditionVelocity"],
                source: SOURCES.crane,
                get calculation() {
                    const GRAVITY_CONSTANT = 32.2; // ft/s^2
                    let density = parent.convertSpecifyUnits("chemicalConditionDensity", "lb/ft3");
                    let frictionFactor = parent.systemConditionFrictionFactor.value;
                    let length = parent.convertSpecifyUnits("systemPropertyPipeLength", "ft");
                    let velocity = parent.convertSpecifyUnits("systemConditionVelocity", "ft/s");
                    let diameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");

                    // darcy's equation from Crane Technical Paper 410 Equation 1-4
                    // dp [psi] = density [lb/ft^3] * f [unitless] * length [ft] * velocity [ft/s] / 144 / diameter [ft] / 2 / gravity constant [32.2 ft/s^2]
                    let pressureDrop = density*frictionFactor*length*Math.pow(velocity,2)/144/diameter/2/GRAVITY_CONSTANT;
                    return parent.convertToLocalUnits("systemConditionPressureDropPipe", pressureDrop, "psi");
                },
            }
        };
    }
}

/*
        this.systemConditionPressureDropPipe = {user: "", units: {value: "psi", quantity: "pressureDifference"}, method: "darcy", label: "Pressure Drop (Pipe Only)",
            methods: {
                darcy: {
                    label: "Darcy Equations",
                    input: ["systemConditionFrictionFactor", "chemicalConditionDensity", "systemPropertyPipeLength", "systemPropertyPipeInnerDiameter", "systemConditionVelocity"],
                    source: SOURCES.crane,
                    get calculation() {
                        const GRAVITY_CONSTANT = 32.2; // ft/s^2
                        let density = eval(this.instance).convertSpecifyUnits("chemicalConditionDensity", "lb/ft3");
                        let frictionFactor = eval(this.instance).systemConditionFrictionFactor.value;
                        let length = eval(this.instance).convertSpecifyUnits("systemPropertyPipeLength", "ft");
                        let velocity = eval(this.instance).convertSpecifyUnits("systemConditionVelocity", "ft/s");
                        let diameter = eval(this.instance).convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");

                        // darcy's equation from Crane Technical Paper 410 Equation 1-4
                        // dp [psi] = density [lb/ft^3] * f [unitless] * length [ft] * velocity [ft/s] / 144 / diameter [ft] / 2 / gravity constant [32.2 ft/s^2]
                        let pressureDrop = density*frictionFactor*length*Math.pow(velocity,2)/144/diameter/2/GRAVITY_CONSTANT;
                        return eval(this.instance).convertToLocalUnits(this.property, pressureDrop, "psi");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/