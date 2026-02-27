class SystemPropertyPipeStandard extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeStandard");

        this.units.quantity = "";

        this.methods = {};

        // VIEW
        this.user.html.optionsArray = arrayOfPipeStandards();
        Object.defineProperty( this.user.html, 'override', { get() { return parent.selectHTML(parent.objectName+".systemPropertyPipeStandard.user.value", this.optionsArray) } } );

        /*this.events = {
            "NPS" : function() {
                parent.implementPreference("systemPropertyPipeNominalDiameter", "2", arrayOfPipeNominalDiameter("NPS"), "in", "", "");
                parent.implementPreference("systemPropertyPipeSchedule", "Sch. 40", arrayOfPipeSchedule("NPS", "2"), "", "", "");
                parent.implementPreference("systemPropertyPipeInnerDiameter", "", "", "in", "", "");
            },
            
            "DN" : [
                ["systemPropertyPipeNominalDiameter", "50", arrayOfPipeNominalDiameter("DN"), "mm", "", ""],
                ["systemPropertyPipeSchedule", "Sch. 40", arrayOfPipeSchedule("DN", "50"), "", "", ""],
                ["systemPropertyPipeInnerDiameter", "", "", "mm", "", ""]
            ],
            "CTS" : [
                ["systemPropertyPipeNominalDiameter", "3/4", arrayOfPipeNominalDiameter("CTS"), "in", "", ""],
                ["systemPropertyPipeSchedule", "Type L", arrayOfPipeSchedule("CTS", "3/4"), "", "", ""],
                ["systemPropertyPipeInnerDiameter", "", "", "in", "", ""]
            ],
            "ACR" : [
                ["systemPropertyPipeNominalDiameter", "5/8", arrayOfPipeNominalDiameter("ACR"), "in", "", ""],
                ["systemPropertyPipeSchedule", "Type D", arrayOfPipeSchedule("ACR", "5/8"), "", "", ""],
                ["systemPropertyPipeInnerDiameter", "", "", "in", "", ""]
            ]
            
        };*/
        
        
    }
    
}