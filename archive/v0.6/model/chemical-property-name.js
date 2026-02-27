class ChemicalPropertyName extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyName");

        this.units.quantity = "";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyCAS"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyCAS.value);
                    return chemicalDataObject.name;
                },
            }
        };

        // use getter so the html override is reference later (when table is built) and not now (during object definition) otherwise errors
        //Object.defineProperty( this.user.html, 'override', { get() { return parent.outputHTML("chemicalPropertyName.user.value") } } );

    }

}