
class ChemicalConditionSonicVelocity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionSonicVelocity");

        this.units.quantity = "velocity";

        this.methods = {
            "compressible gas": {
                label: "tbd",
                input: ["chemicalConditionCpCvRatio", "chemicalPropertyMolecularWeight", "chemicalConditionTemperature"],
                source: "crane",
                get calculation() {
                    let k = parent.chemicalConditionCpCvRatio.value;
                    let g = 32.2; // acceleration of gravity [ft/s^2]
                    let universalGasConstant = 1545;
                    let individualGasConstant = universalGasConstant / parent.chemicalPropertyMolecularWeight.value;
                    let temperature = parent.convertSpecifyUnits("chemicalConditionTemperature", "rankine");
                    return parent.convertToLocalUnits("chemicalConditionSonicVelocity", Math.sqrt(k*g*individualGasConstant*temperature), "ft/s");
                },
            }
        };
    }
}


/*
this.chemicalConditionSonicVelocity = {user: "", units: {value: "m/s", quantity: "velocity"}, method: "compressible gas", label: "Sonic Velocity",
methods: {
    "compressible gas": {
        label: "tbd",
        input: ["chemicalConditionCpCvRatio", "chemicalPropertyMolecularWeight", "chemicalConditionTemperature"],
        source: "crane",
        get calculation() {
            let k = eval(this.instance).chemicalConditionCpCvRatio.value;
            let g = 32.2; // acceleration of gravity [ft/s^2]
            let universalGasConstant = 1545;
            let individualGasConstant = universalGasConstant / eval(this.instance).chemicalPropertyMolecularWeight.value;
            let temperature = eval(this.instance).convertSpecifyUnits("chemicalConditionTemperature", "rankine");
            return eval(this.instance).convertToLocalUnits(this.property, Math.sqrt(k*g*individualGasConstant*temperature), "ft/s");
        },
    }
},
get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
get calculation() {return this.method ? this.methods[this.method].calculation : ""},
get value() {return this.user ? this.user : this.calculation}
};
*/