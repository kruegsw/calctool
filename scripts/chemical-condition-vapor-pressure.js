class ChemicalConditionVaporPressure extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionVaporPressure");

        this.units.quantity = "pressure";

        this.methods = {};
    }
}