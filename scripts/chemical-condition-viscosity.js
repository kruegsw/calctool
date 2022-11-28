class ChemicalConditionViscosity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionViscosity");

        this.units.quantity = "viscosity";
        
        this.methods = {
            sutherland: {
                label: "Sutherland Method",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.moody,
                get calculation() {
                    // checkinputs() ...
                    // need to add logic to detect if inputs are not provided and make value = "" rather than throw error (?)
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "rankine");
                    let mu_o = chemicalDataObject.sutherland.mu_o.value;
                    let T_o = chemicalDataObject.sutherland.T_o.value;
                    let S_mu = chemicalDataObject.sutherland.S_mu.value;
                    return parent.convertToLocalUnits("chemicalConditionViscosity", mu_o * ( (0.555*T_o+S_mu) / (0.555*T+S_mu) ) * Math.pow(T/T_o,3/2), "centipoise");
                },
            }
        };
    }
}