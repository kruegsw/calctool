class ChemicalPropertyCriticalTemperature extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCriticalTemperature");

        this.units.quantity = "temperature";

        this.methods = {};
    }
}