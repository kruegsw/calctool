class SystemConditionFlowMassRate extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemConditionFlowMassRate");

        this.units.quantity = "massRate";

        this.methods = {};
    }
}