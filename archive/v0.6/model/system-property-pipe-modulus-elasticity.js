class SystemPropertyPipeModulusElasticity extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeModulusElasticity");

        this.units.quantity = "modulusElasticity";

        this.methods = {};
    }
}