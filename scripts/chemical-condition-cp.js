class ChemicalConditionCp extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionCp");

        this.units.quantity = "heatCapacity";

        this.methods = {};
    }
}