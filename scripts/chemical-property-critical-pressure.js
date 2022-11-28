class ChemicalPropertyCriticalPressure extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCriticalPressure");

        this.units.quantity = "pressure";

        this.methods = {};
    }
}