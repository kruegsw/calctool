class SystemConditionFrictionFactor extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, methodValue,)
    {
        super(parent, label, user, unitsValue, methodValue, "systemConditionFrictionFactor");

        this.units.quantity = "";

        this.methods = {
            laminar: {
                label: "Laminar Regime",
                input: ["systemConditionReynolds"],
                source: SOURCES.crane,
                get calculation() {
                    return 64 / parent.systemConditionReynolds.value;
                }
            },
            moody: {
                label: "Turbulent Regime (Moody Method)",
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness", "systemPropertyPipeInnerDiameter"],
                source: SOURCES.moody,
                get calculation() {
                    let reynolds = parent.systemConditionReynolds.value;
                    let absoluteRoughness = parent.convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                    let innerDiameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                    let relativeRoughness = absoluteRoughness / innerDiameter;
                    return 0.0055*(1+Math.pow(2*10000*relativeRoughness+1000000/reynolds,1/3));
                }
            },
            colebrooke: {
                label: "Turbulent Regime (Colebrooke Equation)",
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness", "systemPropertyPipeInnerDiameter"],
                source: SOURCES.crane,
                get calculation() {
                    let reynolds = parent.systemConditionReynolds.value;
                    let absoluteRoughness = parent.convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                    let innerDiameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                    let relativeRoughness = absoluteRoughness / innerDiameter;
                    let frictionFactor = 4000; // initial guess at lower end of turbulent range
                    for (let i = 0; i < 10; i++) {
                        frictionFactor = Math.pow(1/(-2*Math.log10(relativeRoughness/3.7+2.51/reynolds/Math.pow(frictionFactor,0.5))),2);
                    //  testBox.innerHTML += "<br>"+frictionFactor;
                    }
                    return frictionFactor;
                }
            },
            niazkar: {
                label: "Turbulent Regime (Niazkar Approximation of the Colebrooke Equation)",
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness", "systemPropertyPipeInnerDiameter"],
                source: SOURCES.niazkar,
                get calculation() {
                    let reynolds = parent.systemConditionReynolds.value;
                    let absoluteRoughness = parent.convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                    let innerDiameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                    let relativeRoughness = absoluteRoughness / innerDiameter;
                    let partA = -2*Math.log10(((relativeRoughness)/3.7)+(4.5547/Math.pow(reynolds,0.8784)));
                    let partB = -2*Math.log10(((relativeRoughness)/3.7)+((2.51*partA)/reynolds));
                    let partC = -2*Math.log10(((relativeRoughness)/3.7)+((2.51*partB)/reynolds));
                    let frictionFactor = Math.pow(1/(partA-Math.pow(partB-partA,2)/(partC-2*partB+partA)),2);
                    return frictionFactor;
                }
            },
            cheng: {
                label: "Intended for All Regimes (Cheng Approximation of the Colebrooke Equation)",
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness", "systemPropertyPipeInnerDiameter"],
                source: SOURCES.niazkar,
                get calculation() {
                    let reynolds = parent.systemConditionReynolds.value;
                    let absoluteRoughness = parent.convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                    let innerDiameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                    let relativeRoughness = absoluteRoughness / innerDiameter;
                    let partA = 1/(1+Math.pow(reynolds/2720,9));
                    let partB = 1/(1+Math.pow(reynolds/(160/relativeRoughness),2));
                    let frictionFactor = 1/(Math.pow((reynolds/64),partA)*Math.pow((1.8*Math.log10(reynolds/6.8)),2*(1-partA)*partB)*Math.pow(2*Math.log10(3.7/relativeRoughness),(2*(1-partA)*(1-partB))));
                    return frictionFactor;
                }
            },
            churchill1973: {
                label: "Turbulent Regime (Churchill 1973 Approximation of the Colebrooke Equation)",
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness", "systemPropertyPipeInnerDiameter"],
                source: SOURCES.churchill1973,
                get calculation() {
                    let reynolds = parent.systemConditionReynolds.value;
                    let absoluteRoughness = parent.convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                    let innerDiameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                    let relativeRoughness = absoluteRoughness / innerDiameter;
                    let frictionFactor = Math.pow(1/(-2*Math.log10(((relativeRoughness)/3.71)+Math.pow(7/reynolds,0.9))),2);
                    return frictionFactor;
                }
            },
            churchill1977: {
                label: "Turbulent Regime (Churchill 1977 Approximation of the Colebrooke Equation)",
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness", "systemPropertyPipeInnerDiameter"],
                source: SOURCES.churchill1977,
                get calculation() {
                    let reynolds = parent.systemConditionReynolds.value;
                    let absoluteRoughness = parent.convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                    let innerDiameter = parent.convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                    let relativeRoughness = absoluteRoughness / innerDiameter;
                    let theta1 = Math.pow(-2.457*Math.log(Math.pow(7/reynolds,0.9)+0.27*relativeRoughness),16);
                    let theta2 = Math.pow(37530/reynolds,16);
                    let frictionFactor = 8*Math.pow(Math.pow(8/reynolds,12)+(1/(Math.pow(theta1+theta2,1.5))),(1/12));
                    return frictionFactor;
                }
            },
        };
    }
}

/*
       this.systemConditionFrictionFactor = {user: "", units: {value: "", quantity: ""}, method: "laminar", label: "Friction Factor",
            methods: {
                laminar: {
                    label: "Laminar Regime",
                    input: ["systemConditionReynolds"],
                    source: SOURCES.crane,
                    get calculation() {
                        return 64 / eval(this.instance).systemConditionReynolds.value;
                    }
                },
                moody: {
                    label: "Turbulent Regime (Moody Method)",
                    input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness"],
                    source: SOURCES.moody,
                    get calculation() {
                        let reynolds = eval(this.instance).systemConditionReynolds.value;
                        let absoluteRoughness = eval(this.instance).convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                        let innerDiameter = eval(this.instance).convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                        let relativeRoughness = absoluteRoughness / innerDiameter;
                        return 0.0055*(1+Math.pow(2*10000*relativeRoughness+1000000/reynolds,1/3));
                    }
                },
                colebrooke: {
                    label: "Turbulent Regime (Colebrooke Equation)",
                    input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness"],
                    source: SOURCES.crane,
                    get calculation() {
                        let reynolds = eval(this.instance).systemConditionReynolds.value;
                        let absoluteRoughness = eval(this.instance).convertSpecifyUnits("systemPropertyPipeAbsoluteRoughness", "ft");
                        let innerDiameter = eval(this.instance).convertSpecifyUnits("systemPropertyPipeInnerDiameter", "ft");
                        let relativeRoughness = absoluteRoughness / innerDiameter;
                        let frictionFactor = 4000; // initial guess at lower end of turbulent range
                        for (let i = 0; i < 10; i++) {
                            frictionFactor = Math.pow(1/(-2*Math.log10(relativeRoughness/3.7+2.51/reynolds/Math.pow(frictionFactor,0.5))),2);
                        //  testBox.innerHTML += "<br>"+frictionFactor;
                        }
                        return frictionFactor;
                    }
                },

            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
        };
*/