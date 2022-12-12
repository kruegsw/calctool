class ChemicalConditionPhase extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionPhase");

        this.units.quantity = "";

        this.methods = {
            "basedOnVaporPressure": {
                label: "",
                input: ["chemicalConditionVaporPressure", "chemicalConditionPressure", "chemicalPropertyCriticalPressure", "chemicalConditionTemperature"],
                source: "",
                get calculation() {
                    let pressure = parent.convertSpecifyUnits("chemicalConditionPressure", "Pa absolute");
                    let vaporPressure = parent.convertSpecifyUnits("chemicalConditionVaporPressure", "Pa absolute");
                    let criticalPressure = parent.convertSpecifyUnits("chemicalPropertyCriticalPressure", "Pa absolute");
                    let phase = "liquid"
                    if (vaporPressure > criticalPressure) {return phase = "gas"}
                    else if (vaporPressure > pressure) {return phase = "vapor"}
                    // else if (temperature < meltingPoint) {let phase = "solid"} *need melting point data
                    return phase;
                },
            }
        };
    }
}