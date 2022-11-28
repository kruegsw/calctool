class ChemicalPropertyCAS extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyCAS");

        this.units.quantity = "";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyName"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    return chemicalDataObject.cas;
                },
            }
        };
    }
}


/*
        this.chemicalPropertyCAS = {user: "", units: {value: "", quantity: ""}, method: "lookup", label: "CAS Number",
            methods: {
                lookup: {
                    label: "",
                    input: ["chemicalPropertyName"],
                    source: "",
                    get calculation() {
                        let chemicalDataObject = selectChemicalDataObject(eval(this.instance).chemicalPropertyName.value);
                        return chemicalDataObject.cas;
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/