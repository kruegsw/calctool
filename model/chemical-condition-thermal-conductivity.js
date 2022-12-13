class ChemicalConditionThermalConductivity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionThermalConductivity");

        this.units.quantity = "thermalConductivity";

        this.methods = {
            perryVaporCorrelation: { // TABLE 2-145 Vapor Thermal Conductivity of Inorganic and Organic Substances [W/(m∙K)]
                label: "Emprical Correlation of Vapor Thermal Conductivity (Perry's)",
                input: ["chemicalPropertyCAS", "chemicalConditionTemperature", "chemicalPropertyCriticalTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyCAS.value);
                        let equation = chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.equation.value;
                        let C1 = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.C1.value;
                        let C2 = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.C2.value;
                        let C3 = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.C3.value;
                        let C4 = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.C4.value;
                        let Tmin = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.Tmin.value;
                        let valueAtTmin = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.valueAtTmin.value;
                        let Tmax = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.Tmax.value;
                        let valueAtTmax = +chemicalDataObject.empirical.gaseous.thermalConductivity.perryCorrelation.valueAtTmax.value;
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    let Tcritical = parent.chemicalPropertyCriticalTemperature.value;
                    let Tr = T * (1/Tcritical);
                    if (equation === "102") {
                        console.log(`equation used: ${equation}`);
                        let thermalConductivity = C1*Math.pow(T,C2)*(1/(1+C3*(1/T)+C4*(1/Math.pow(T,2))));
                        return parent.convertToLocalUnits("chemicalConditionThermalConductivity", thermalConductivity, "W/m/K");
                    } else { // equation "100"
                        console.log(`equation used: ${equation}`);
                        let thermalConductivity = C1+C2*T+C3*Math.pow(T,2)+C4*Math.pow(T,3);
                        return parent.convertToLocalUnits("chemicalConditionThermalConductivity", thermalConductivity, "W/m/K");
                    };
                },
            },
            perryLiquidCorrelation: { // TABLE 2-147 Thermal Conductivity of Inorganic and Organic Liquids [W/(m∙K)]
                label: "Emprical Correlation of Liquid Thermal Conductivity (Perry's)",
                input: ["chemicalPropertyCAS", "chemicalConditionTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyCAS.value);
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                        let C1 = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.C1.value;
                        let C2 = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.C2.value;
                        let C3 = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.C3.value;
                        let C4 = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.C4.value;
                        let C5 = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.C5.value;
                        let Tmin = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.Tmin.value;
                        let valueAtTmin = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.valueAtTmin.value;
                        let Tmax = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.Tmax.value;
                        let valueAtTmax = +chemicalDataObject.empirical.liquid.thermalConductivity.perryCorrelation.valueAtTmax.value;
                    let thermalConductivity = C1+C2*T+C3*Math.pow(T,2)+C4*Math.pow(T,3)+C5*Math.pow(T,4);
                    return parent.convertToLocalUnits("chemicalConditionThermalConductivity", thermalConductivity, "W/m/K");
                },
            },
        };
    }
}