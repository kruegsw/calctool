function defaultUnits(quantity) {return UNIT_SYSTEM.metric[quantity] ? UNIT_SYSTEM.metric[quantity] : ""};

function unitsArrayForTable(quantity) {

    let dropDownArray =  Object.keys(UNITS[quantity]);
    
    let optionalHtmlTextArray = [];
    
    for (let unit of dropDownArray) {
        optionalHtmlTextArray.push(UNITS[quantity][unit].symbol);
    }
    return [dropDownArray, optionalHtmlTextArray];

};

function convertUnits(quantity, oldValue, oldUnits, newUnits) {
    let valueInBaseUnits = UNITS[quantity][oldUnits].convertToBaseUnits(oldValue); // This function doesn't seem to use the 'oldValue' parameter...
    let valueInNewUnits = UNITS[quantity][newUnits].convertFromBaseUnits(valueInBaseUnits);// This function doesn't seem to use the 'valueInBaseUnits' parameter...
    //if(newUnits === "psig") {console.log(`Converted ${oldValue} ${oldUnits} to ${valueInNewUnits} ${newUnits}`)};
    return valueInNewUnits;

};

function determineFormula(numeratorArray, denominatorArray) {
    
    let combinedFormula = {};
    for (let unit of numeratorArray) {
        console.log(unit);
        for (let baseUnit of Object.keys(unit)) {
            combinedFormula[baseUnit] ? combinedFormula[baseUnit] += unit[baseUnit] : combinedFormula[baseUnit] = unit[baseUnit];
            if (combinedFormula[baseUnit] == 0) {delete combinedFormula[baseUnit]};
        }
        console.log(combinedFormula);
    }
    console.log(combinedFormula);
    for (let unit of denominatorArray) {
        console.log(unit);
        for (let baseUnit of Object.keys(unit)) {
            combinedFormula[baseUnit] ? combinedFormula[baseUnit] -= unit[baseUnit] : combinedFormula[baseUnit] = -unit[baseUnit];
            if (combinedFormula[baseUnit] == 0) {delete combinedFormula[baseUnit]};
        }
        console.log(combinedFormula);
    }
    console.log(combinedFormula);
    return combinedFormula;
};


const UNIT_FORMULA = {
    // quantity: { numerator: {...quantity type & number in numerator...}, denominator {...quantity type & number in denominator...} }

    // standard units
    length: {length: 1}, // meter
    mass: {mass: 1}, // kilogram
    time: {time: 1}, // second
    current: {current: 1}, // ampere
    temperature: {temperature: 1}, // K
    luminouIntensity: {luminouIntensity: 1}, // candela
    substance: {substance: 1}, // mole
    anglePlane: {anglePlane: 1}, // radian
    angleSolid: {angleSolid: 1}, // steradian

    // derived units
    get acceleration() {return determineFormula([this.length],[this.time, this.time])}, // m/s2
    get angularAcceleration() {return determineFormula([this.anglePlane],[this.time, this.time])}, // rad/s2
    get angularVelocity() {return determineFormula([this.anglePlane],[this.time])}, // rad/s
    get area() {return determineFormula([this.length, this.length],[])}, // m2
    get concentrationMass() {return determineFormula([this.mass],[this.volume])}, // kg/m3
    get concentrationMolar() {return determineFormula([this.substance],[this.volume])}, // mol/m3
    get currentDensity() {return determineFormula([this.current],[this.area])}, // A/m2
    get densityMass() {return determineFormula([this.mass],[this.volume])}, //"kg/m3",
    get electricChargeDensity() {return determineFormula([this.electricCharge],[this.volume])}, // C/m3 == A*2/m3 
    get electricFieldStrength() {return determineFormula([this.electricPotential],[this.length])}, // V/m == W/A/m == J/s/A/m == N*m/s/A/m == kg*m*m/s2/s/A/m == kg*m/s3/A
    get electricFluxDensity() {return determineFormula([this.electricCharge],[this.area])}, //"C/m2",
    get energyDensity() {return determineFormula([this.energy],[this.volume])}, // J/m3 = kg*m2/s2/m3 = kg/m/s2
    get entropy() {return this.heatCapacity}, //"J/K",
    get heatCapacity() {return determineFormula([this.energy],[this.temperature])}, //"W/m2", //"J/K",
    get heatFluxDensity() {return determineFormula([this.power],[this.area])}, //"W/m2",
    get irradiance() {return this.heatFluxDensity}, //"W/m2",
    get luminance() {return determineFormula([this.luminouIntensity],[this.area])}, //"cd/m2",
    get magneticFieldStrength() {return determineFormula([this.current],[this.length])}, //"A/m",
    get molarEnergy() {return determineFormula([this.energy],[this.substance])}, // J/mol = kg*m/s2/mol
    get molarEntropy() {return this.molarHeatCapacity}, // J/mol/K
    get molarHeatCapacity() {return determineFormula([this.energy],[this.substance, this.temperature])}, // J/mol/K
    get momentOfForce() {return determineFormula([this.force],[this.length])}, //"N*m",
    get permeability() {return determineFormula([this.inductance],[this.length])}, //"H/m",
    get permittivity() {return determineFormula([this.capacitance],[this.length])}, //"F/m",
    get radiance() {return determineFormula([this.radiantIntensity],[this.area])}, //"W/m2/sr",
    get radiantIntensity() {return determineFormula([this.power],[this.angleSolid])}, //"W/sr",
    get specificEnergy() {return determineFormula([this.energy],[this.mass])}, //"J/kg",
    get specificEntropy() {return this.specificHeatCapacity}, //"J/kg/K",
    get specificHeatCapacity() {return determineFormula([this.energy],[this.mass, this.temperature])}, //"J/kg/K",
    get specificVolume() {return determineFormula([this.volume],[this.mass])}, //"m3/kg",
    get surfaceTension() {return determineFormula([this.force],[this.length])}, // N/m
    get thermalConductivity() {return determineFormula([this.power],[this.length, this.temperature])}, // W/m/K
    get velocity() {return determineFormula([this.length],[this.time])}, // m/s
    get viscosityDynamic() {return determineFormula([this.pressure, this.time],[])}, // Pa*s
    get viscosityKinematic() {return determineFormula([this.area],[this.time])}, // m2/s
    get volume() {return determineFormula([this.length, this.length, this.length],[])}, // m3
    get waveNumber() {return determineFormula([],[this.length])}, // 1/m

//get tbdtbdtbd() {return determineFormula([],[])},

    // derived units with special names
    get absorbedDose() {return determineFormula([this.energy],[this.mass])}, // Gy "gray" = J/kg
    get activityOfRadionuclides() {return determineFormula([],[this.time])}, // Bq "becquerel" = I/s
    get capacitance() {return determineFormula([this.electricCharge],[this.electricPotential])}, // F "farad" = C/V
    get conductance() {return determineFormula([this.current],[this.electricPotential])}, // S "siemens" = A/V
    get electricPotential() {return determineFormula([this.power],[this.current])}, // V "volt" = W / A
    get electricResistance() {return determineFormula([this.electricPotential],[this.current])}, // "ohm" = V / A
    get energy() {return determineFormula([this.force, this.length],[])}, // J "joule" = N*m
    get force() {return determineFormula([this.mass, this.length],[this.time, this.time])}, // N "newton" = kg*m/s2
    get frequency() {return determineFormula([],[this.time])}, // Hz "hertz" = 1/s
    get illuminance() {return determineFormula([this.luminousFlux],[this.area])}, // lx "lux" = lm/m2
    get inductance() {return determineFormula([this.magneticFlux],[this.current])}, // H "henry" = Wb/A
    get luminousFlux() {return determineFormula([this.luminouIntensity, this.angleSolid],[])}, // lm "lumen" = Cd*sr
    get magneticFlux() {return determineFormula([this.electricPotential, this.time],[])}, // Wb "weber" = V*s
    get magneticFluxDensity() {return determineFormula([this.magneticFlux],[this.area])}, // T "tesla" = Wb/m2
    get power() {return determineFormula([this.energy],[this.time])}, // W "watt" = J/s
    get pressure() {return determineFormula([this.force],[this.area])}, // Pa "pascal" = N/m2
    get electricCharge() {return determineFormula([this.current, this.time],[])}, // C "coulomb" = A*s
}

const HTML_SYMBOL_CODES = {
    supTwo: "&#178",
    supThree: "&#179",
    dotOperator: "&sdot;",
    degreeSymbol: "&deg;",
}

const UNIT_SYSTEM = {

    metric: {
        // standard units
        length: "meter",
        mass: "kilogram",
        time: "second",
        current: "ampere",
        temperature: "K",
        intensity: "candela",
        substance: "mole",
        anglePlane: "radian",
        angleSolid: "steradian",

        // derived units
        acceleration: "m/s2",
        angularAcceleration: "rad/s2",
        angularVelocity: "rad/s",
        area: "m2",
        concentrationMass: "kg/m3",
        concentrationMolar: "mol/m3",
        currentDensity: "A/m2",
        densityMass: "kg/m3",
        electricChargeDensity: "C/m3",
        electricFieldStrength: "V/m",
        electricFluxDensity: "C/m2",
        energyDensity: "J/m3",
        entropy: "J/K",
        heatCapacity: "J/K",
        heatFluxDensity: "W/m2",
        irradiance: "W/m2",
        luminance: "cd/m2",
        magneticFieldStrength: "A/m",
        molarEnergy: "J/mol",
        molarEntropy: "J/mol/K",
        molarHeatCapacity: "K/mol/K",
        momentOfForce: "N*m",
        permeability: "H/m",
        permittivity: "F/m",
        radiance: "W/m2/sr",
        radiantIntensity: "W/sr",
        specificEnergy: "J/kg",
        specificEntropy: "J/kg/K",
        specificHeatCapacity: "J/kg/K",
        specificVolume: "m3/kg",
        surfaceTension: "W/m/K",
        thermalConductivity: "W/m/k",
        velocity: "m/s",
        viscosityDynamic: "Pa*s",
        viscosityKinematic: "m2/s",
        volume: "m3",
        waveNumber: "1/m",

        //constants

    }
}

const UNITS = {
// HTML codes for superscript numbers https://www.htmlsymbols.xyz/miscellaneous-symbols/subscript-and-superscript/superscript-numbers

    "": {"": ""},

    acceleration: {
        "m/s2": {name: "meter per second squared", symbol: "m/s"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    angularAcceleration: {
        "rad/s2": {name: "radian per second squared", symbol: "rad/s"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    angularVelocity: {
        "rad/s": {name: "radian per second", symbol: "rad/s", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    anglePlane: {
        "radian": {name: "radian", symbol: "rad", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    angleSolid: {
        "steradian": {name: "steradian", symbol: "st", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    area: {
        "m2": {name: "square meters", symbol: "m"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "ft2": {name: "square feet", symbol: "ft"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235,2)), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,2)},
        "in2": {name: "square inches", symbol: "in"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235 * 12,2)), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235 * 12,2)},
    },

    //needs work, probably a method defined above which uses molecular weight
    concentrationMassMolarCombined: {

        "kg/m3": {name: "kilogram per cubic meter", symbol: "kg/m"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "lb/ft3": {name: "pound per cubic foot", symbol: "lb/ft"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue * (1/2.2046226218487758) * Math.pow(3.2808398950131235,3), convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758 / Math.pow(3.2808398950131235,3)},
    
        "mol/m3": {name: "mole per cubic meter", symbol: "mol/m"+HTML_SYMBOL_CODES.supThree /* supserscript 3 */, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "mol/dm3": {name: "mole per cubic decimeter", symbol: "mol/dm"+HTML_SYMBOL_CODES.supThree /* supserscript 3 */, convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000)},

    },
    // above needs work

    concentrationMass: {
        "kg/m3": {name: "kilogram per cubic meter", symbol: "kg/m"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "g/m3": {name: "gram per cubic meter", symbol: "g/m"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue * (1/1000), convertFromBaseUnits: (baseValue) => +baseValue * 1000},
        "g/dm3": {name: "gram per cubic decimeter", symbol: "g/dm"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "lb/ft3": {name: "pound per cubic foot", symbol: "lb/ft"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue * (1/2.2046226218487758) * Math.pow(3.2808398950131235,3), convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758 / Math.pow(3.2808398950131235,3)},
        "lb/gal": {name: "pound per US gallon", symbol: "lb/gal", convertToBaseUnits: (oldValue) => +oldValue * (1/0.133680556) * (1/2.2046226218487758) * Math.pow(3.2808398950131235,3), convertFromBaseUnits: (baseValue) => +baseValue * 0.133680556 * 2.2046226218487758 / Math.pow(3.2808398950131235,3)},
    },

    concentrationMolar: {
        "mol/m3": {name: "mole per cubic meter", symbol: "mol/m"+HTML_SYMBOL_CODES.supThree /* supserscript 3 */, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "mol/dm3": {name: "mole per cubic decimeter", symbol: "mol/dm"+HTML_SYMBOL_CODES.supThree /* supserscript 3 */, convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000)},
    },

    /*
    cvUnits: {
        units1: {name: "units1", symbol: "symbol1", factor: 1},
        units2: {name: "units2", symbol: "symbol2", factor: 2},
        units0Half: {name: "unitsHalf", symbol: "symbolhalf", factor: 0.5},
    },
    */

    currentDensity: {
        "A/m2": {name: "ampere per square meter", symbol: "A/m"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    electricChargeDensity: {
        "C/m3": {name: "coulomb per cubic meter", symbol: "C/m"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},

    },

    electricFieldStrength: {
        "V/m": {name: "volt per meter", symbol: "V/m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},

    },

    electricFluxDensity: {
        "C/m2": {name: "coulomb per square meter", symbol: "C"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    energyDensity: {
        "J/m3": {name: "joule per cubic meter", symbol: "J/m"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},

    },

    entropy: {
        "J/K": {name: "joule per kelvin", symbol: "J/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    heatCapacity: {
        "J/K": {name: "joule per kelvin", symbol: "J/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    heatFluxDensity: {
        "W/m2": {name: "watt per square meters", symbol: "W/m"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    irradiance: {
        "W/m2": {name: "watt per square meters", symbol: "W/m"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    luminance: {
        "cd/m2": {name: "candela per square meters", symbol: "cd/m"+HTML_SYMBOL_CODES.supTwo, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    luminouIntensity: {
        "cd": {name: "candela", symbol: "cd", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    length: {
        "meter": {name: "meter", symbol: "m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "mm": {name: "millimeter", symbol: "mm", convertToBaseUnits: (oldValue) => +oldValue * (1/1000), convertFromBaseUnits: (baseValue) => +baseValue * 1000},
        "ft": {name: "foot", symbol: "ft", convertToBaseUnits: (oldValue) => +oldValue * (1/3.2808398950131235), convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235},
        "in": {name: "inch", symbol: "in", convertToBaseUnits: (oldValue) => +oldValue * (1/3.2808398950131235) * (1/12), convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235 * 12},
    },

    magneticFieldStrength: {
        "A/m": {name: "ampere per meter", symbol: "A/m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    mass: {
        kilogram: {name: "kilogram", symbol: "kg", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        pound: {name: "pound", symbol: "lb", convertToBaseUnits: (oldValue) => +oldValue * (1/2.2046226218487758), convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758},
        "metric ton": {name: "metric ton", symbol: "MT", convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue / 1000},
    },

    massRate: {
        "kg/hr": {name: "kilogram per hour", symbol: "kg/hr", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "lb/hr": {name: "pound per hour", symbol: "lb/hr", convertToBaseUnits: (oldValue) => +oldValue * (1/2.2046226218487758), convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758},
        //"SCFM": {name: "standard cubic foot per hour", symbol: "SCFM (air: 14.7 psia, 60 "+"&deg;"+"F)", convertToBaseUnits: (oldValue) => +oldValue / 2.2046226218487758 * 4.583, convertFromBaseUnits: (baseValue) => +baseValue * 2.2046226218487758 / 4.583},
    },

    /*
    modulusElasticity: this.pressure,
    */

    molarEnergy: {
        "J/mol": {name: "joule per mole", symbol: "J/mol", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "J/kmol": {name: "joule per kmole", symbol: "J/kmol", convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000)},
    },

    molarEntropy: {
        "J/mol/K": {name: "joule per mole-kelvin", symbol: "J/mol/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "J/kmol/K": {name: "joule per kmole-kelvin", symbol: "J/kmol/K", convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000)},
    },

    molarHeatCapacity: {
        "J/mol/K": {name: "joule per mole-kelvin", symbol: "J/mol/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "J/kmol/K": {name: "joule per kmole-kelvin", symbol: "J/kmol/K", convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000)},
    },

    molarVolume: {
        "m3/mol": {name: "cubic meter per mole", symbol: "m"+HTML_SYMBOL_CODES.supThree+"/mol", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "m3/kmol": {name: "cubic meter per kmole", symbol: "m"+HTML_SYMBOL_CODES.supThree+"/kmol", convertToBaseUnits: (oldValue) => +oldValue * (1/1000), convertFromBaseUnits: (baseValue) => +baseValue * 1000},
        "cm3/mol": {name: "cubic centimeter per mole", symbol: "cm"+HTML_SYMBOL_CODES.supThree+"/mol", convertToBaseUnits: (oldValue) => +oldValue * (1/1000000), convertFromBaseUnits: (baseValue) => +baseValue * 1000000},   
    },

    momentOfForce: {
        "N*m": {name: "newton-meter", symbol: "N"+"&sdot;"+"m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    pressure: {
        "Pa absolute": {name: "pascal", symbol: "Pa", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "MPa absolute": {name: "megapascal", symbol: "MPa", convertToBaseUnits: (oldValue) => +oldValue * 1000000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000000)},
        "psia": {name: "pound per square inch", symbol: "psia", convertToBaseUnits: (oldValue) => +oldValue * 6894.757293, convertFromBaseUnits: (baseValue) => +baseValue * (1/6894.757293)},
        "psig": {name: "pound per square inch", symbol: "psig", convertToBaseUnits: (oldValue) => +oldValue * 6894.757293 + 101325, convertFromBaseUnits: (baseValue) => (+baseValue - 101325) * (1/6894.757293)},
        "bar absolute": {name: "bar", symbol: "bar", convertToBaseUnits: (oldValue) => +oldValue * 100000, convertFromBaseUnits: (baseValue) => +baseValue * (1/100000)},
        "atm absolute": {name: "atmospheric pressure", symbol: "atm", convertToBaseUnits: (oldValue) => +oldValue * 101325, convertFromBaseUnits: (baseValue) => +baseValue * (1/101325)},
        "inH2O absolute": {name: "inches of water", symbol: "inH2O", convertToBaseUnits: (oldValue) => +oldValue * 248.84, convertFromBaseUnits: (baseValue) => +baseValue * (1/248.84)},
        "inHg absolute": {name: "inches of mercury", symbol: "inHg", convertToBaseUnits: (oldValue) => +oldValue * 3386.38866667, convertFromBaseUnits: (baseValue) => +baseValue * (1/3386.38866667)},
    },

    pressureDifference: {
        "Pa": {name: "pascal", symbol: "Pa", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "psi": {name: "pounds per square inch", symbol: "psi", convertToBaseUnits: (oldValue) => +oldValue * 6894.757293, convertFromBaseUnits: (baseValue) => +baseValue * (1/6894.757293)},
        "bar": {name: "bar", symbol: "bar", convertToBaseUnits: (oldValue) => +oldValue * 100000, convertFromBaseUnits: (baseValue) => +baseValue * (1/100000)},
        "atm": {name: "atmospheric pressure", symbol: "atm", convertToBaseUnits: (oldValue) => +oldValue * 101325, convertFromBaseUnits: (baseValue) => +baseValue * (1/101325)},
        "inH2O": {name: "inches of water", symbol: "inH2O", convertToBaseUnits: (oldValue) => +oldValue * 248.84, convertFromBaseUnits: (baseValue) => +baseValue * (1/248.84)},
        "inHg": {name: "inches of mercury", symbol: "inHg", convertToBaseUnits: (oldValue) => +oldValue * 3386.38866667, convertFromBaseUnits: (baseValue) => +baseValue * (1/3386.38866667)},
    },

    permeability: {
        "H/m": {name: "henry per meter", symbol: "H/m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    permittivity: {
        "F/m": {name: "farad per meter", symbol: "F/m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    radiance: {
        "W/m2/sr": {name: "watt per square meter-steradian", symbol: "W/m"+HTML_SYMBOL_CODES.supThree+"/sr", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    radiantIntensity: {
        "W/sr": {name: "watt per steradian", symbol: "W/sr", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    specificEnergy: {
        "J/kg": {name: "joule per kilogram", symbol: "J/kg", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "kJ/kg": {name: "kilojoule per kilogram", symbol: "kJ/kg", convertToBaseUnits: (oldValue) => +oldValue * 1000, convertFromBaseUnits: (baseValue) => +baseValue * (1/1000)},
        "BTU/lb": {name: "BTU per pound", symbol: "BTU/lb", convertToBaseUnits: (oldValue) => +oldValue * 1.05505585262 * 1000 * 2.2046226218487758, convertFromBaseUnits: (baseValue) => +baseValue * (1/1.05505585262) * (1/1000) * (1/2.2046226218487758)},
    
    },

    specificEntropy: {
        "J/kg/K": {name: "joule per kilogram-kelvin", symbol: "J/kg/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    specificHeatCapacity: {
        "J/kg/K": {name: "joule per kilogram-kelvin", symbol: "J/kg/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "BTU/lb/F": {name: "BTU per pound-fahrenheit", symbol: "BTU/lb/F", convertToBaseUnits: (oldValue) => +oldValue * 1.05505585262 * 1000 * 2.2046226218487758 * 9/5, convertFromBaseUnits: (baseValue) => +baseValue * (1/1.05505585262) * (1/1000) * (1/2.2046226218487758) * 5/9},
    },

    specificVolume: {
        "m3/kg": {name: "cubic meter per kilorgram", symbol: "m"+HTML_SYMBOL_CODES.supThree+"/kg", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    surfaceTension: {
        "N/m": {name: "newton per meter", symbol: "N/m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
    },

    thermalConductivity: {
        "W/m/K": {name: "watt per meter-kelvin", symbol: "W/m/K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},  
    },

    temperature: {
        "K": {name: "kelvin", symbol: "&deg;"+"K", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue}, //Base Units
        "C": {name: "celsius", symbol: "&deg;"+"C", convertToBaseUnits: (oldValue) => +oldValue + 273.15, convertFromBaseUnits: (baseValue) => +baseValue - 273.15},
        "F": {name: "fahrenheit", symbol: "&deg;"+"F", convertToBaseUnits: (oldValue) => (+oldValue - 32) * (5/9) + 273.15, convertFromBaseUnits: (baseValue) => (+baseValue - 273.15) * (1/(5/9)) + 32 },
        "R": {name: "rankine", symbol: "&deg;"+"R", convertToBaseUnits: (oldValue) => +oldValue * (5/9), convertFromBaseUnits: (baseValue) => +baseValue * (1/(5/9))},
    },

    velocity: {
        "m/s": {name: "meter per second", symbol: "m/s", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "ft/s": {name: "foot per second", symbol: "ft/s", convertToBaseUnits: (oldValue) => +oldValue * (1/3.2808398950131235), convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235},
        "mph": {name: "mile per hour", symbol: "mph", convertToBaseUnits: (oldValue) => +oldValue * (1/3.2808398950131235) * 5280 * (1/60) * (1/60), convertFromBaseUnits: (baseValue) => +baseValue * 3.2808398950131235 * (1/5280) * 60 * 60},
    },

    viscosityDynamic: { // or absolute viscosity
        "Pa*s": {name: "pascal-second", symbol: "Pa"+"&sdot;"+"s", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "poise": {name: "poise", symbol: "P", convertToBaseUnits: (oldValue) => +oldValue * (1/10), convertFromBaseUnits: (baseValue) => +baseValue * 10},
        "centipoise": {name: "centipoise", symbol: "cP", convertToBaseUnits: (oldValue) => +oldValue * (1/100) * (1/10), convertFromBaseUnits: (baseValue) => +baseValue * 100 * 10},
        "mPa-s": {name: "millipascal-second", symbol: "mPa"+"&sdot;"+"s", convertToBaseUnits: (oldValue) => +oldValue * (1/1000), convertFromBaseUnits: (baseValue) => +baseValue * 1000},
    },

    viscosityKinematic: {
        "m2/s": {name: "square meter per second", symbol: "m"+HTML_SYMBOL_CODES.supTwo+"/s", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},   
    },

    volume: {
        "m3": {name: "cubic meter", symbol: "m"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "ft3": {name: "cubic foot", symbol: "ft"+HTML_SYMBOL_CODES.supThree, convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235,3)), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3)},
    },
    
    volumeRate: {
        "m3/s": {name: "cubic meter per second", symbol: "m"+HTML_SYMBOL_CODES.supThree+"/s", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
        "m3/m": {name: "cubic meter per minute", symbol: "m"+HTML_SYMBOL_CODES.supThree+"/min", convertToBaseUnits: (oldValue) => +oldValue * (1/60), convertFromBaseUnits: (baseValue) => +baseValue * 60},
        "m3/h": {name: "cubic meter per second", symbol: "m"+HTML_SYMBOL_CODES.supThree+"/hr", convertToBaseUnits: (oldValue) => +oldValue * (1/60) * (1/60), convertFromBaseUnits: (baseValue) => +baseValue * 60 * 60},
        "ft3/s": {name: "cubic foot per second", symbol: "ft"+HTML_SYMBOL_CODES.supThree+"/s", convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235,3)), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3)},
        "ft3/m": {name: "cubic foot per minute", symbol: "ft"+HTML_SYMBOL_CODES.supThree+"/min", convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235,3)) * (1/60), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3) * 60},
        "ft3/h": {name: "cubic foot per hour", symbol: "ft"+HTML_SYMBOL_CODES.supThree+"/hr", convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235,3)) * (1/60) * (1/60), convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3) * 60 * 60},
        "gpm": {name: "US gallon per minute", symbol: "gpm", convertToBaseUnits: (oldValue) => +oldValue * (1/Math.pow(3.2808398950131235,3)) * (1/60) * 0.133680556, convertFromBaseUnits: (baseValue) => +baseValue * Math.pow(3.2808398950131235,3) * 60 * (1/0.133680556)},
    
    },

    waveNumber: {
        "1/m": {name: "reciprocal meter", symbol: "1/m", convertToBaseUnits: (oldValue) => +oldValue, convertFromBaseUnits: (baseValue) => +baseValue},
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