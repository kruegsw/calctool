class ChemicalPropertyCriticalCompressibilityFactor extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCriticalCompressibilityFactor");

        this.units.quantity = "";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyName"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    return chemicalDataObject.criticalCompressibilityFactorZc.value;
                },
            }
        };
    }
}