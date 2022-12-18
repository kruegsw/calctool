class ChemicalPropertySearch extends FlowModelTemplate {
    constructor(parent, labelValue, userValue, unitsValue, methodValue)
    {
        super(parent, labelValue, userValue, unitsValue, methodValue, "chemicalPropertySearch");

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
        //[casArray, searchTermArray] = chemicalArrayForTable();
        //this.user.html.optionsArray = casArray;
        //let optionalHtmlTextArray = searchTermArray;
        // use getter so the html override is reference later (when table is built) and not now (during object definition) otherwise errors
        Object.defineProperty( this.user.html, 'override', { get() { return parent.dataListHTML("chemicalPropertySearch.user.value", chemicalArrayForTable()[0], chemicalArrayForTable()[1]) } } );


    }

}