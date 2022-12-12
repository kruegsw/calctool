class ChemicalPropertyName extends FlowModelTemplate {
    constructor(parent, labelValue, userValue, unitsValue, methodValue)
    {
        super(parent, labelValue, userValue, unitsValue, methodValue, "chemicalPropertyName");

        /*
        this.overrideUserHtml = {
            user: {
                get html() {return parent.dataListHTML("chemicalPropertyName.user.value", arrayOfChemicalSearchTerms())}
            }
        }
        */

        /*
        this.user = {
            value: userValue,
            optionsArray: arrayOfChemicalSearchTerms(),
            html: {
                get default() {return parent.inputHTML(instanceProperty, "user", "value")},
                get override() {return parent.dataListHTML("chemicalPropertyName.user.value", arrayOfChemicalSearchTerms())},
                get value() {return this.override ? this.override : this.default}
            },
        };
        */

        // this.user.html.override = "";

        this.units.quantity = "";

        this.methods = {};

        // VIEW
        this.user.html.optionsArray = arrayOfChemicalSearchTerms();
        Object.defineProperty( this.user.html, 'override', { get() { return parent.dataListHTML("chemicalPropertyName.user.value", this.optionsArray) } } );


    }

}