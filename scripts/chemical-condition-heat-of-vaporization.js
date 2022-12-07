class ChemicalConditionHeatOfVaporization extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionHeatOfVaporization");

        this.units.quantity = "specificEnergy";

        this.methods = {
            perryCorrelation: { // TABLE 2-69 Heats of Vaporization of Inorganic and Organic Liquids (J/kmol)
                label: "Emprical Correlation of Heats of Vaporization (Perry's)",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    let molecularWeight = +chemicalDataObject.molecularWeight.value;
                    let C1 = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.C1.value;
                    let C2 = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.C2.value;
                    let C3 = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.C3.value;
                    let C4 = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.C4.value;
                    let Tmin = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.Tmin.value;
                    let valueAtTmin = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.valueAtTmin.value;
                    let Tmax = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.Tmax.value;
                    let valueAtTmax = +chemicalDataObject.empirical.liquid.heatVaporization.perryCorrelation.valueAtTmax.value;
                    let Tcritical = +chemicalDataObject.criticalTemperature.value;
                    let Tr = T * (1/Tcritical);
                    let tau = 1 - Tr;
                    let heatVaporization = C1 * Math.pow(tau,C2+C3*Tr+C4*Math.pow(Tr,2));
                    return parent.convertToLocalUnits("chemicalConditionHeatOfVaporization", heatVaporization / molecularWeight, "J/kg");
                },
            },
        };
    }
}