class ChemicalConditionDensity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionDensity");

        this.units.quantity = "concentrationMass";

        this.methods = {
            idealGas: {
                label: "Ideal Gas Law",
                input: ["chemicalPropertyName", "chemicalConditionTemperature", "chemicalConditionPressure", "chemicalPropertyMolecularWeight"],
                source: "",
                get calculation() {
                    //let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    let temperature = parent.convertSpecifyUnits("chemicalConditionTemperature", "R");
                    let pressure = parent.convertSpecifyUnits("chemicalConditionPressure", "psia");
                    let gasConstant = 10.731; // ft3 * psia / lbmol / degR
                    let molecularWeight = parent.chemicalPropertyMolecularWeight.value;
                    return parent.convertToLocalUnits("chemicalConditionDensity", molecularWeight * pressure / gasConstant / temperature, "lb/ft3");
                },
            },

            perryLiquidCorrelation: {
                label: "Emprical Correlation of Liquid Density (Perry's)",
                input: ["chemicalPropertyName", "chemicalConditionTemperature", "chemicalPropertyMolecularWeight", "chemicalPropertyCriticalTemperature"],
                source: SOURCES.perry,
                get calculation() {

                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                        let equation = chemicalDataObject.empirical.liquid.density.perryCorrelation.equation.value;
                        let C1 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C1.value;
                        let C2 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C2.value;
                        let C3 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C3.value;
                        let C4 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C4.value;
                        let C5 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C5.value;
                        let C6 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C6.value;
                        let C7 = +chemicalDataObject.empirical.liquid.density.perryCorrelation.C7.value;
                        let Tmin = +chemicalDataObject.empirical.liquid.density.perryCorrelation.Tmin.value;
                        let valueAtTmin = +chemicalDataObject.empirical.liquid.density.perryCorrelation.valueAtTmin.value;
                        let Tmax = +chemicalDataObject.empirical.liquid.density.perryCorrelation.Tmax.value;
                        let valueAtTmax = +chemicalDataObject.empirical.liquid.density.perryCorrelation.valueAtTmax.value;
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    let molecularWeight = parent.chemicalPropertyMolecularWeight.value;
                    let Tcritical = parent.chemicalPropertyCriticalTemperature.value;
                    let tau = 1 - ( T * (1/Tcritical) );

                    if (equation === "105") {
                        console.log(`equation used: ${equation}`);
                        let density = C1 / (Math.pow(C2,(1+Math.pow(1-(T*(1/C3)),C4))));
                        return parent.convertToLocalUnits("chemicalConditionDensity", density*molecularWeight, "g/dm3");
                    } else {
                        console.log(`equation used: ${equation}`);
                        let density = C1+C2*Math.pow(tau,1/3)+C3*Math.pow(tau,2/3)+C4*Math.pow(tau,5/3)+C5*Math.pow(tau,16/3)+C6*Math.pow(tau,46/3)+C7*Math.pow(tau,110/3);
                        console.log(`density from equation ${equation} is ${density}.`);
                        return parent.convertToLocalUnits("chemicalConditionDensity", density*molecularWeight, "g/dm3");
                    };
                },
            },
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