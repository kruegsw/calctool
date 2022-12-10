class ChemicalConditionViscosity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionViscosity");

        this.units.quantity = "viscosityDynamic";

        /* TEST CODE FOR AUTO SELECTION OF METHOD
        //Object.defineProperty( this.method.html, 'override', { get() { return parent.inputHTML("chemicalConditionViscosity.method.user", this.optionsArray) } } );
        Object.defineProperty( this.method.html, 'override', { get() { return parent.dataListHTML("chemicalConditionViscosity.method.user", this.optionsArray) } } );

        Object.defineProperty( this.method, 'calculation',  // determine method preference
            { get() {
                if(parent.chemicalConditionViscosity.methods.perryVaporCorrelation.calculation) {return "perryVaporCorrelation"};
                if(parent.chemicalConditionViscosity.methods.perryLiquidCorrelation.calculation) {return "perryLiquidCorrelation"};
                if(parent.chemicalConditionViscosity.methods.sutherland.calculation) {return "sutherland"};
                return "";
            } }
        );
        // END TEST CODE FOR AUTO SELECTION OF METHOD*/
        
        this.methods = {
            sutherland: {
                label: "Sutherland Method",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.moody,
                get calculation() {
                    // checkinputs() ...
                    // need to add logic to detect if inputs are not provided and make value = "" rather than throw error (?)
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                        let mu_o = chemicalDataObject.empirical.gaseous.viscosity.sutherland.mu_o.value;
                        let T_o = chemicalDataObject.empirical.gaseous.viscosity.sutherland.T_o.value;
                        let S_mu = chemicalDataObject.empirical.gaseous.viscosity.sutherland.S_mu.value;
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "R");
                    return parent.convertToLocalUnits("chemicalConditionViscosity", mu_o * ( (0.555*T_o+S_mu) / (0.555*T+S_mu) ) * Math.pow(T/T_o,3/2), "centipoise");
                },
            },
            perryVaporCorrelation: { // TABLE 2-138 Vapor Viscosity of Inorganic and Organic Substances (Pa∙s)
                label: "Emprical Correlation of Vapor Viscosity (Perry's)",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                        let C1 = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.C1.value;
                        let C2 = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.C2.value;
                        let C3 = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.C3.value;
                        let C4 = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.C4.value;
                        let Tmin = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.Tmin.value;
                        let valueAtTmin = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.valueAtTmin.value;
                        let Tmax = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.Tmax.value;
                        let valueAtTmax = +chemicalDataObject.empirical.gaseous.viscosity.perryCorrelation.valueAtTmax.value;
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    let viscosity = C1*Math.pow(T,C2) * (1/(1+C3*(1/T))+C4*(1/Math.pow(T,2)));
                    return parent.convertToLocalUnits("chemicalConditionViscosity", viscosity, "Pa*s");
                },
            },
            perryLiquidCorrelation: { // TABLE 2-139 Viscosity of Inorganic and Organic Liquids (Pa∙s)
                label: "Emprical Correlation of Liquid Viscosity (Perry's)",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                        let equation = chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.equation.value;
                        let C1 = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.C1.value;
                        let C2 = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.C2.value;
                        let C3 = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.C3.value;
                        let C4 = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.C4.value;
                        let C5 = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.C5.value;
                        let Tmin = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.Tmin.value;
                        let valueAtTmin = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.valueAtTmin.value;
                        let Tmax = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.Tmax.value;
                        let valueAtTmax = +chemicalDataObject.empirical.liquid.viscosity.perryCorrelation.valueAtTmax.value;
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    if (equation === "101") {
                        console.log(`equation used: ${equation}`);
                        let viscosity = Math.exp(C1+C2*(1/T)+C3*Math.log(T)+C4*Math.pow(T,C5));
                        return parent.convertToLocalUnits("chemicalConditionViscosity", viscosity, "Pa*s");
                    } else { // equation "100"
                        console.log(`equation used: ${equation}`);
                        let viscosity = C1+C2*T+C3*Math.pow(T,2)+C4*Math.pow(T,3)*C5*Math.pow(T,4);
                        return parent.convertToLocalUnits("chemicalConditionViscosity", viscosity, "Pa*s");
                    };
                },
            },
        };
    }
}