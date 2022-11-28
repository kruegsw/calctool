class ChemicalConditionPressure extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionPressure");

        this.units.quantity = "pressure";

        this.methods = {};
    }
}