class ChemicalPropertyCriticalMolarVolume extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCriticalMolarVolume");

        this.units.quantity = "molarVolume";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyName"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    return parent.convertToLocalUnits("chemicalPropertyCriticalMolarVolume", chemicalDataObject.criticalMolarVolume.value, "cm3/mol");
                },
            }
        };
    }
}