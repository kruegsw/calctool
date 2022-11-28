class ChemicalPropertyNormalBoilingTemperature extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyNormalBoilingTemperature");

        this.units.quantity = "temperature";

        this.methods = {};
    }
}