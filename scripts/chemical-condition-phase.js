class ChemicalConditionPhase extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalConditionPhase");

        this.units.quantity = "";

        this.methods = {};
    }
}