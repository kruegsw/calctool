class ChemicalConditionVaporPressure extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionVaporPressure");

        this.units.quantity = "pressure";

        this.methods = {
            perryVaporPressureCorrelation: { // TABLE 2-8 Vapor Pressure of Inorganic and Organic Liquids (P in Pa, T in K)
                label: "Emprical Correlation of Vapor Pressure (Perry's)",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                        let C1 = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.C1.value;
                        let C2 = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.C2.value;
                        let C3 = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.C3.value;
                        let C4 = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.C4.value;
                        let C5 = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.C5.value;
                        let Tmin = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.Tmin.value;
                        let valueAtTmin = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.valueAtTmin.value;
                        let Tmax = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.Tmax.value;
                        let valueAtTmax = +chemicalDataObject.empirical.gaseous.vaporPressure.perryCorrelation.valueAtTmax.value;
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    let vaporPressure = Math.exp(C1+C2*(1/T)+C3*Math.log(T)+C4*Math.pow(T,C5));
                    //console.log(vaporPressure);
                    return parent.convertToLocalUnits("chemicalConditionVaporPressure", vaporPressure, "Pa absolute");
                },
            },
        };
    }
}