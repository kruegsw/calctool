function defaultUnits(quantity) {return METRIC[quantity] ? METRIC[quantity] : ""};

function unitsArrayForTable(quantity) {

    let dropDownArray =  Object.keys(UNITS[quantity]);
    
    let optionalHtmlTextArray = [];
    
    for (let unit of dropDownArray) {
        console.log(unit);
        optionalHtmlTextArray.push(UNITS[quantity][unit].symbol);
    }
    return [dropDownArray, optionalHtmlTextArray];

};

function convertUnits(quantity, oldValue, oldUnits, newUnits) {
    //console.log("quantity is" + quantity);
    //console.log("oldUnits is" + oldUnits);
    //console.log("UNITS[quantity][oldUnits] is" + UNITS[quantity][oldUnits]);
    //console.log(UNITS[quantity][oldUnits].convertToBaseUnits(oldValue));
    let valueInBaseUnits = UNITS[quantity][oldUnits].convertToBaseUnits(oldValue); // This function doesn't seem to use the 'oldValue' parameter...
    //console.log('valueInBaseUnits is: ' + valueInBaseUnits);
    //console.log(valueInBaseUnits);
    let valueInNewUnits = UNITS[quantity][newUnits].convertFromBaseUnits(valueInBaseUnits);// This function doesn't seem to use the 'valueInBaseUnits' parameter...
    //console.log('valueInNewUnits is: ' + valueInNewUnits);
    //console.log(valueInNewUnits);
    return valueInNewUnits;
};

const METRIC = {
    // base units
    length: "meter",
    mass: "kilogram",
    time: "second",
    current: "ampere",
    temperature: "K",
    intensity: "candela",
    substance: "mole",

    // derived units
    acceleration: "m/s2",
    viscosity: "centipoise",

    //constants

}

const UNIT_SYSTEM = ["metric", "imperial", "USCS"];

const UNITS = {
// HTML codes for superscript numbers https://www.htmlsymbols.xyz/miscellaneous-symbols/subscript-and-superscript/superscript-numbers

    "": {
        "": {name: "", symbol: ""},
    },

    dummyUnits: {
        units1: {name: "units1", symbol: "symbol1", factor: 1},
        units2: {name: "units2", symbol: "symbol2", factor: 2},
        units0Half: {name: "unitsHalf", symbol: "symbolhalf", factor: 0.5},
    },

    acceleration: {
        "m/s2": {name: "meter per second squared", symbol: "m/s"+"&#178" /* supserscript 2 */, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    anglePlane: {
        "radian": {name: "radian", symbol: "rad", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    angleSolid: {
        "steradian": {name: "steradian", symbol: "st", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    area: {
        "m^2": {name: "square meters", symbol: "m"+"&#178" /* supserscript 2 */, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "ft^2": {name: "square feet", symbol: "ft"+"&#178" /* supserscript 2 */, convertToBaseUnits: (oldValue) => +oldValue / Math.pow(3.2808398950131235,2), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,2)},
        "in^2": {name: "square inches", symbol: "in"+"&#178" /* supserscript 2 */, convertToBaseUnits: (oldValue) => +oldValue / Math.pow(3.2808398950131235 * 12,2), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235 * 12,2)},
    },

    cvUnits: {
        units1: {name: "units1", symbol: "symbol1", factor: 1},
        units2: {name: "units2", symbol: "symbol2", factor: 2},
        units0Half: {name: "unitsHalf", symbol: "symbolhalf", factor: 0.5},
    },

    density: {
        "kg/m3": {name: "kilogram per meter cubed", symbol: "kg/m"+"&#179" /* supserscript 3 */, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "lb/ft3": {name: "pound per cubic foot", symbol: "lb/ft"+"&#179" /* supserscript 3 */, convertToBaseUnits: (oldValue) => +oldValue / 2.2046226218487758 * Math.pow(3.2808398950131235,3), convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758 / Math.pow(3.2808398950131235,3)},

    },

    heatCapacity: {
        "BTU/lb/F": {name: "BTU/lb/F", symbol: "BTU/lb/F", factor: 1},
    },

    length: {
        "meter": {name: "meter", symbol: "m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "mm": {name: "millimeter", symbol: "mm", convertToBaseUnits: (oldValue) => +oldValue / 1000, convertFromBaseUnits: (baseValue) => +baseValue * 1000},
        "ft": {name: "foot", symbol: "ft", convertToBaseUnits: (oldValue) => +oldValue / 3.2808398950131235, convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235},
        "in": {name: "inch", symbol: "in", convertToBaseUnits: (oldValue) => +oldValue / 3.2808398950131235 / 12, convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235 * 12},
    },

    mass: {
        kilogram: {name: "kilogram", symbol: "kg", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        pound: {name: "pound", symbol: "lb", convertToBaseUnits: (oldValue) => +oldValue / 2.2046226218487758, convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758},
        "metric ton": {name: "metric ton", symbol: "MT", convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue / 1000},
    },

    massRate: {
        "kg/hr": {name: "kilogram per hour", symbol: "kg/hr", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "lb/hr": {name: "pound per hour", symbol: "lb/hr", convertToBaseUnits: (oldValue) => +oldValue / 2.2046226218487758, convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758},
    },

    modulusElasticity: {
        units1: {name: "units1", symbol: "symbol1", factor: 1},
        units2: {name: "units2", symbol: "symbol2", factor: 2},
        units0Half: {name: "unitsHalf", symbol: "symbolhalf", factor: 0.5},
    },

    molarVolume: {
        "m3/mol": {name: "cubic meters per mole", symbol: "m"+"&#179"+"/mol", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "m3/kmol": {name: "cubic meters per kmole", symbol: "m"+"&#179"+"/kmol", convertToBaseUnits: (oldValue) => +oldValue / 1000, convertFromBaseUnits: (baseValue) => +baseValue * 1000},
        "cm3/mol": {name: "cubic centimeters per mole", symbol: "cm"+"&#179"+"/mol", convertToBaseUnits: (oldValue) => +oldValue / 1000000, convertFromBaseUnits: (baseValue) => +baseValue * 1000000},
    
    },

    pressure: {
        "Pa absolute": {name: "pascal", symbol: "Pa", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "MPa absolute": {name: "megapascal", symbol: "MPa", convertToBaseUnits: (oldValue) => +oldValue * 1000000, convertFromBaseUnits: (baseValue) => +baseValue / 1000000},
        "psia": {name: "pounds per square inch", symbol: "psi", convertToBaseUnits: (oldValue) => +oldValue * 6894.757293, convertFromBaseUnits: (baseValue) => +baseValue / 6894.757293},
        "psig": {name: "pounds per square inch", symbol: "psi", convertToBaseUnits: (oldValue) => ( +oldValue * 6894.757293 ) + 101325, convertFromBaseUnits: (baseValue) => ( +baseValue / 6894.757293 ) - 101325},
        "bar absolute": {name: "bar", symbol: "bar", convertToBaseUnits: (oldValue) => +oldValue * 100000, convertFromBaseUnits: (baseValue) => +baseValue / 100000},
        "atm absolute": {name: "atmospheric pressure", symbol: "atm", convertToBaseUnits: (oldValue) => +oldValue * 101325, convertFromBaseUnits: (baseValue) => +baseValue / 101325},
        "inH2O absolute": {name: "inches of water", symbol: "inH2O", convertToBaseUnits: (oldValue) => +oldValue * 248.84, convertFromBaseUnits: (baseValue) => +baseValue / 248.84},
        "inHg absolute": {name: "inches of mercury", symbol: "inHg", convertToBaseUnits: (oldValue) => +oldValue * 3386.38866667, convertFromBaseUnits: (baseValue) => +baseValue / 3386.38866667},
    },

    pressureDifference: {
        "Pa": {name: "pascal", symbol: "Pa", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "psi": {name: "pounds per square inch", symbol: "psi", convertToBaseUnits: (oldValue) => +oldValue * 6894.757293, convertFromBaseUnits: (baseValue) => +baseValue / 6894.757293},
        "bar": {name: "bar", symbol: "bar", convertToBaseUnits: (oldValue) => +oldValue * 100000, convertFromBaseUnits: (baseValue) => +baseValue / 100000},
        "atm": {name: "atmospheric pressure", symbol: "atm", convertToBaseUnits: (oldValue) => +oldValue * 101325, convertFromBaseUnits: (baseValue) => +baseValue / 101325},
        "inH2O": {name: "inches of water", symbol: "inH2O", convertToBaseUnits: (oldValue) => +oldValue * 248.84, convertFromBaseUnits: (baseValue) => +baseValue / 248.84},
        "inHg": {name: "inches of mercury", symbol: "inHg", convertToBaseUnits: (oldValue) => +oldValue * 3386.38866667, convertFromBaseUnits: (baseValue) => +baseValue / 3386.38866667},
    },

    temperature: {
        /*convert: (oldValue, oldUnits, newUnits) => {
            let temperatureInCelsius;
            switch (oldUnits) {
                case "kelvin":
                    temperatureInCelsius = oldValue - 273.15;
                    break;
                case "fahrenheit":
                    temperatureInCelsius = (oldValue - 32) * 5/9;
                    break;
                case "rankine":
                    temperatureInCelsius = (oldValue - (32 + 459.67)) * 5/9;
                    break;
                default: // celsius
                    temperatureInCelsius = oldValue;
                    break;
            }
            let newTemperature;
            switch (newUnits) {
                case "kelvin":
                    newTemperature = temperatureInCelsius + 273.15;
                    break;
                case "fahrenheit":
                    newTemperature = (temperatureInCelsius * 5/9) + 32;
                    break;
                case "rankine":
                    newTemperature = (temperatureInCelsius * 5/9) + 32 + 459.67;
                    break;
                default: // celsius
                    newTemperature = temperatureInCelsius;
                    break;
            }
            return newTemperature;
        },*/
        "C": {name: "celsius", symbol: "&deg;"+"C", convertToBaseUnits: (oldValue) => +oldValue + 273.15, convertFromBaseUnits: (baseValue) => +baseValue - 273.15},
        "K": {name: "kelvin", symbol: "&deg;"+"K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue}, //Base Units
        "F": {name: "fahrenheit", symbol: "&deg;"+"F", convertToBaseUnits: (oldValue) => (+oldValue - 32) * (5/9) + 273.15, convertFromBaseUnits: (baseValue) => (+baseValue - 273.15) * 5/9 + 32},
        "R": {name: "rankine", symbol: "&deg;"+"R", convertToBaseUnits: (oldValue) => +oldValue * (5/9), convertFromBaseUnits: (baseValue) => +baseValue / (5/9)},
    },

    velocity: {
        "m/s": {name: "meter", symbol: "m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "ft/s": {name: "foot", symbol: "ft", convertToBaseUnits: (oldValue) => +oldValue / 3.2808398950131235, convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235},
        "miles/hr": {name: "miles per hour", symbol: "mph", convertToBaseUnits: (oldValue) => +oldValue / 3.2808398950131235 * 5280 / 60 / 60, convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235 / 5280 * 60 * 60},
    },

    viscosity: { //dynamic or absolute viscosity
        poise: {name: "poise", symbol: "P", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        centipoise: {name: "centipoise", symbol: "cP", convertToBaseUnits: (oldValue) => +oldValue / 100, convertFromBaseUnits: (baseValue) => +baseValue * 100},
        "mPa-s": {name: "millipascal-second", symbol: "cP", convertToBaseUnits: (oldValue) => +oldValue / 100, convertFromBaseUnits: (baseValue) => +baseValue * 100},

    },

    
    volumeRate: {
        "m^3/s": {name: "cubic meters per second", symbol: "m"+"&#179"+"/s", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "m^3/m": {name: "cubic meters per minute", symbol: "m"+"&#179"+"/min", convertToBaseUnits: (oldValue) => +oldValue / 60, convertFromBaseUnits: (baseValue) => +baseValue * 60},
        "m^3/h": {name: "cubic meters per second", symbol: "m"+"&#179"+"/hr", convertToBaseUnits: (oldValue) => +oldValue / 60 / 60, convertFromBaseUnits: (baseValue) => +baseValue * 60 * 60},
        "ft^3/s": {name: "cubic feet per second", symbol: "ft"+"&#179"+"/s", convertToBaseUnits: (oldValue) => +oldValue / Math.pow(3.2808398950131235,3), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3)},
        "ft^3/m": {name: "cubic feet per minute", symbol: "ft"+"&#179"+"/min", convertToBaseUnits: (oldValue) => +oldValue / Math.pow(3.2808398950131235,3) / 60, convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3) * 60},
        "ft^3/h": {name: "cubic feet per hour", symbol: "ft"+"&#179"+"/hr", convertToBaseUnits: (oldValue) => +oldValue / Math.pow(3.2808398950131235,3) / 60 / 60, convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3) * 60 * 60},
    },



    /*
    mass: {name: "kilogram", symbol: "kg", value: 1},
    time: {name: "second", symbol: "s", value: 1},
    current: {name: "ampere", symbol: "A", value: 1},
    temperature: {name: "kelvin", symbol: "K", value: 1},
    intensity: {name: "candela", symbol: "cd", value: 1},
    substance: {name: "mole", symbol: "mol", value: 1}
    */
}

/*
const UNITS = {
    acceleration: "",
    amountOfSubstance: "",
    area: "",
    catalyticActivity: "",
    capacitance: "",
    heatTransferCoefficient: "",
    conductance: "",
    electricCharge: "",
    electricCurrent: "",
    electromotiveForce: "", //same units as voltage and electromotive force
    energy: "", //same units as quantity of heat and energy and work
    energyDensity: "",
    density: "",
    force: "",
    frequency: "",
    heatFlowRate: "", //same as units as power and flow of heat
    heatQuantity: "", //same units as quantity of heat and energy and work
    heatCapacity: "",
    inductance: "",
    length: "",
    luminousFlux: "",
    illuminance: "",
    luminousIntensity: "",
    magneticFlux: "",
    magneticFluxDensity: "",
    mass: "",
    momentum: "",
    planeAngle: "",
    power: "", //same as units as power and flow of heat
    pressure: "", //same units as pressure and stress
    radiationDose: "",
    radiationDoseAbsorbed: "",
    radioactivity: "",
    resistance: "",
    solidAngle: "",
    strain: "",
    stress: "", //same units as pressure and stress
    temperature: "",
    time: "",
    velocity: "",
    voltage: "", //same units as voltage and electromotive force
    volume: "",
    work: "", //same units as quantity of heat and energy and work
}
*/


/*
IEAL GAS LAW
PV = nRT

Gas Constants (R)
  8.31446261815324          J⋅K−1⋅mol−1
  8.31446261815324          m3⋅Pa⋅K−1⋅mol−1
  8.31446261815324          kg⋅m2⋅s−2⋅K−1⋅mol−1
  8314.46261815324          L⋅Pa⋅K−1⋅mol−1
  8.31446261815324          L⋅kPa⋅K−1⋅mol−1
  0.0831446261815324        L⋅bar⋅K−1⋅mol−1
  8.31446261815324×107      erg⋅K−1⋅mol−1
  0.730240507295273         atm⋅ft3⋅lbmol−1⋅°R−1
  10.731577089016           psi⋅ft3⋅lbmol−1⋅°R−1
  1.985875279009            BTU⋅lbmol−1⋅°R−1
  297.031214                inH2O⋅ft3⋅lbmol−1⋅°R−1
  554.984319180             torr⋅ft3⋅lbmol−1⋅°R−1
  0.082057366080960         L⋅atm⋅K−1⋅mol−1
  62.363598221529           L⋅Torr⋅K−1⋅mol−1
  1.98720425864083...       cal⋅K−1⋅mol−1
  8.20573660809596...×10−5  m3⋅atm⋅K−1⋅mol−1
*/