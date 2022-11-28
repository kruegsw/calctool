class SystemPropertyPipeNominalDiameter extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "systemPropertyPipeNominalDiameter");

        this.units.quantity = "length";

        this.methods = {};

        // VIEW
        this.user.html.optionsArray = arrayOfPipeNominalDiameter(parent.systemPropertyPipeStandard.value);
        Object.defineProperty( this.user.html, 'override', { get() { return parent.selectHTML("systemPropertyPipeNominalDiameter.user.value", this.optionsArray) } } );
        
        this.units.html.optionsArray = arrayOfPipeNominalDiameter(parent.systemPropertyPipeStandard.value);
        Object.defineProperty( this.units.html, 'override', { get() { return parent.outputHTML("systemPropertyPipeNominalDiameter.units.value") } } );


        /*
        this.preference = {
            "how do we get this to trigger whenever nominal diameter is changed?" : [
                ["systemPropertyPipeSchedule", parent.systemPropertyPipeSchedule.user, arrayOfPipeSchedule(parent.systemPropertyPipeStandard.user, this.systemPropertyPipeNominalDiameter.user), "", "", ""]
            ]
        };
        */
    }
}

/*
class PipeNominalDiameter {
    constructor(parent, user, unitsValue, method)
    {
        this.parent =  parent.objectName;
        this.user = user;
        this.units = {value: unitsValue, quantity: ""};
        this.method = method;
        this.label = "Nominal Diameter";
        this.methods = {
            tbd: {
                label: "tbd",
                input: ["tbd", "tbd"],
                source: "tbd",
                get calculation() {
                    return "tbd"
                },
            }
        };
    }
    get input() {return this.method ? this.methods[this.method].input : ""}; // inputs for the current method selected
    get calculation() {return this.method ? this.methods[this.method].calculation : ""};
    get value() {return this.user ? this.user : this.calculation};
}
*/