class SystemPropertyPipeSchedule extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeSchedule");

        this.units.quantity = "";

        this.methods = {};

        // VIEW
        this.user.html.optionsArray = arrayOfPipeSchedule(parent.systemPropertyPipeStandard.value, parent.systemPropertyPipeNominalDiameter.value);
        Object.defineProperty( this.user.html, 'override', { get() { return parent.selectHTML(parent.objectName+".systemPropertyPipeSchedule.user.value", this.optionsArray) } } );
       
    }
}