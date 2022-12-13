class ChemicalPropertyNormalBoilingTemperature extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyNormalBoilingTemperature");

        this.units.quantity = "temperature";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyCAS"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyCAS.value);
                    return parent.convertToLocalUnits("chemicalPropertyNormalBoilingTemperature", chemicalDataObject.normalBoilingTemperature.value, "K");
                },
            }
        };
    }
}