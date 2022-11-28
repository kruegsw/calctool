class SystemConditionPressureDropTotal extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemConditionPressureDropTotal");

        this.units.quantity = "pressureDifference";

        this.methods = {};
    }
}