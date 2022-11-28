class ChemicalConditionCpCvRatio extends FlowModelTemplate {
    constructor(parent, labelValue, userValue, unitsValue, methodValue)
    {
        super(parent, labelValue, userValue, unitsValue, methodValue, "chemicalConditionCpCvRatio");

        this.units.quantity = "";

        this.methods = {
            heatCapacityRatio: {
                label: "Heat Capacity Ratio Cp/Cv",
                input: ["chemicalConditionCp", "chemicalConditionCv"],
                source: "",
                get calculation() {
                    return parent.chemicalConditionCp.value / parent.chemicalConditionCv.value
                },
            }
        };
    }
}