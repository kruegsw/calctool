class ChemicalPropertyCriticalTemperature extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCriticalTemperature");

        this.units.quantity = "temperature";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyName"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    return parent.convertToLocalUnits("chemicalPropertyCriticalTemperature", chemicalDataObject.criticalTemperature.value, "K");
                },
            }
        };
    }
}