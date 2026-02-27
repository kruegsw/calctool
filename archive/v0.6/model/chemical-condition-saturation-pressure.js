class ChemicalConditionSaturationPressure extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionSaturationPressure");

        this.units.quantity = "pressure";

        this.methods = {};
    }
}