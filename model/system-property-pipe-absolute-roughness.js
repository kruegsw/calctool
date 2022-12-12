class SystemPropertyPipeAbsoluteRoughness extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeAbsoluteRoughness");

        this.units.quantity = "length";

        this.methods = {
            empirical: {
                label: "Absolute Roughness",
                input: ["systemPropertyPipeMaterial"],
                source: SOURCES.moody,
                get calculation() {
                    return parent.convertToLocalUnits("systemPropertyPipeAbsoluteRoughness", selectPipeMaterialDataObject(parent.systemPropertyPipeMaterial.value).roughness, "ft");
                },
            }
        };
    }
}

/*
        this.systemPropertyPipeAbsoluteRoughness = {user: "", units: {value: "ft", quantity: "length"}, method: "empirical", label: "Absolute Roughness",
            methods: {
                empirical: {
                    label: "Absolute Roughness",
                    input: ["systemPropertyPipeMaterial"],
                    source: SOURCES.moody,
                    get calculation() {
                        return eval(this.instance).convertToLocalUnits(this.property, selectPipeMaterialDataObject(eval(this.instance).systemPropertyPipeMaterial.value).roughness, "ft");
                    },
                }
            },
            get input() {return this.method ? this.methods[this.method].input : ""}, // inputs for the current method selected
            get calculation() {return this.method ? this.methods[this.method].calculation : ""},
            get value() {return this.user ? this.user : this.calculation}
*/