class ChemicalConditionDensity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionDensity");

        this.units.quantity = "concentrationMass";

        this.methods = {
            idealGas: {
                label: "Ideal Gas Law",
                input: ["chemicalPropertyName", "chemicalConditionTemperature", "chemicalConditionPressure"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    let temperature = parent.convertSpecifyUnits("chemicalConditionTemperature", "R");
                    let pressure = parent.convertSpecifyUnits("chemicalConditionPressure", "psia");
                    let gasConstant = 10.731; // ft3 * psia / lbmol / degR
                    let molecularWeight = chemicalDataObject.molecularWeight.value;
                    return parent.convertToLocalUnits("chemicalConditionDensity", molecularWeight * pressure / gasConstant / temperature, "lb/ft3");
                },
            }
        };
    }
}


/*
        this.chemicalConditionDensity = {user: "", units: {value: "lb/ft3", quantity: "density"}, method: "idealGas", label: "Density",
            methods: {
                idealGas: {
                    label: "Ideal Gas Law",
                    input: ["chemicalPropertyName", "chemicalConditionTemperature", "chemicalConditionPressure"],
                    source: "",
                    get calculation() {
                        let chemicalDataObject = selectChemicalDataObject(eval(this.instance).chemicalPropertyName.value);
                        let temperature = eval(this.instance).convertSpecifyUnits("chemicalConditionTemperature", "rankine");
                        let pressure = eval(this.instance).convertSpecifyUnits("chemicalConditionPressure", "psia");
                        let gasConstant = 10.731; // ft3 * psia / lbmol / degR
                        let molecularWeight = chemicalDataObject.molecularWeight.value;
                        return eval(this.instance).convertToLocalUnits(this.property, molecularWeight * pressure / gasConstant / temperature, "lb/ft3");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/