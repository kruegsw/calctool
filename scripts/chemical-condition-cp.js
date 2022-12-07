class ChemicalConditionCp extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionCp");

        this.units.quantity = "specificHeatCapacity";

        this.methods = {
            perryLiquidCorrelation: { // TABLE 2-72 Heat Capacities of Inorganic and Organic Liquids [J/(kmol∙K)]
                label: "Emprical Correlation of Liquid Heat Capacity at Constant Pressure (Perry's)",
                input: ["chemicalPropertyName", "chemicalConditionTemperature"],
                source: SOURCES.perry,
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyName.value);
                    let T = parent.convertSpecifyUnits("chemicalConditionTemperature", "K");
                    let molecularWeight = +chemicalDataObject.molecularWeight.value;
                    let equation = chemicalDataObject.empirical.liquid.cp.perryCorrelation.equation.value;
                    console.log(equation);
                    let C1 = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.C1.value;
                    let C2 = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.C2.value;
                    let C3 = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.C3.value;
                    let C4 = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.C4.value;
                    let C5 = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.C5.value;
                    let Tmin = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.Tmin.value;
                    let valueAtTmin = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.valueAtTmin.value;
                    let Tmax = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.Tmax.value;
                    let valueAtTmax = +chemicalDataObject.empirical.liquid.cp.perryCorrelation.valueAtTmax.value;
                    let Tcritical = +chemicalDataObject.criticalTemperature.value;
                    let tau = 1 - ( T * (1/Tcritical) );
                    if (equation === "2-114") {
                        console.log(`equation used: ${equation}`);
                        let cp = Math.pow(C1,2)*(1/tau)+C2-2*C1*C3*tau-C1*C4*Math.pow(tau,2)-Math.pow(C3,2)*Math.pow(tau,3)*(1/3)-C3*C4*Math.pow(tau,4)*(1/2)-Math.pow(C4,2)*Math.pow(tau,5)*(1/5);
                        console.log(`density from equation ${equation} is ${cp}.`);
                        return parent.convertToLocalUnits("chemicalConditionCp", cp*(1/molecularWeight), "J/kg/K");
                    } else { // equation "100"
                        console.log(`equation used: ${equation}`);
                        console.log(`C1: ${C1}`);
                        console.log(`C2: ${C2}`);
                        console.log(`C3: ${C3}`);
                        console.log(`C4: ${C4}`);
                        console.log(`C5: ${C5}`);
                        console.log(`T: ${T}`);
                        let cp = C1+C2*T+C3*Math.pow(T,2)+C4*Math.pow(T,3)+C5*Math.pow(T,4);
                        console.log(`density from equation ${equation} is ${cp}.`);
                        return parent.convertToLocalUnits("chemicalConditionCp", cp*(1/molecularWeight), "J/kg/K");
                    };
                },
            },
        };
    }
}