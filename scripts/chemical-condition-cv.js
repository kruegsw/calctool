class ChemicalConditionCv extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionCv");

        this.units.quantity = "specificHeatCapacity";

        this.methods = {};
    }
}