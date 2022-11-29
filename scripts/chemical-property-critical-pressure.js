class ChemicalPropertyCriticalPressure extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCriticalPressure");

        this.units.quantity = "pressure";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyName"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    return parent.convertToLocalUnits("chemicalPropertyCriticalPressure", chemicalDataObject.criticalPressure.value, "MPa absolute");
                },
            }
        };
    }
}