class ChemicalPropertyAcentricFactor extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyAcentricFactor");

        this.units.quantity = "";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyCAS"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyCAS.value);
                    return chemicalDataObject.acentricFactor.value;
                },
            }
        };
    }
}