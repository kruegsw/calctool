class ChemicalPropertyFamily extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyFamily");

        this.units.quantity = "";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyName"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    return chemicalDataObject.family.value;
                },
            }
        };
    }
}