class ChemicalConditionPhase extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionPhase");

        this.units.quantity = "";

        this.methods = {
            "basedOnVaporPressure": {
                label: "",
                input: ["chemicalConditionVaporPressure", "chemicalConditionPressure"],
                source: "",
                get calculation() {
                    let pressure = parent.convertSpecifyUnits("chemicalConditionPressure", "Pa absolute");
                    let vaporPressure = parent.convertSpecifyUnits("chemicalConditionVaporPressure", "Pa absolute");
                    let phase = vaporPressure >= pressure ? "vapor" : "liquid"
                    return phase;
                },
            }
        };
    }
}