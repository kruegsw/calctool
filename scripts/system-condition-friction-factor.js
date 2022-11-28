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
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness"],
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
                input: ["systemConditionReynolds", "systemPropertyPipeAbsoluteRoughness"],
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