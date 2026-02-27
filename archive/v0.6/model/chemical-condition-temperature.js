class ChemicalConditionTemperature extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionTemperature");

        this.units.quantity = "temperature";

        this.methods = {};
    }
}