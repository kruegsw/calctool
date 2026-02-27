class SystemPropertyPipeMaterial extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeMaterial");

        this.units.quantity = "";

        this.methods = {};

        // VIEW
        this.user.html.optionsArray = arrayOfPipeMaterialNames();
        Object.defineProperty( this.user.html, 'override', { get() { return parent.selectHTML(parent.objectName+".systemPropertyPipeMaterial.user.value", this.optionsArray) } } );

    }
}
