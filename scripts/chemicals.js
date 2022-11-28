
//https://doc.comsol.com/5.5/doc/com.comsol.help.cfd/cfd_ug_fluidflow_high_mach.08.27.html
//https://www.adobe.com/acrobat/online/pdf-to-excel.html




//const chemicalSearchFilter() { //return an object {seachKey: chemicalCAS}, for example {"132259-10-0 (air)": "132259-10-0"}
//	forSutherlandViscosity: function() {
//														// determine chemicals with necessary parameters specified for calculation
//														Object.keys(PROPERTIES).map((element, index, array) => element + " (" + PROPERTIES[element].name + ")")
//													}
//};


// ==============================
//ABOVE COULD BE REPLACED WITH SQL
// ==============================

function selectChemicalDataObject(chemicalIdentifier) { // select object from PROPERTIES array based on properties: searchTerm, cas, or name
	return PROPERTIES.filter((element, index, array) => ( element.searchTerm === chemicalIdentifier || element.cas === chemicalIdentifier || element.name === chemicalIdentifier))[0]; // [0] to select object in array
}

function arrayOfChemicalSearchTerms() {return PROPERTIES.map((chemical, index, array) => {return chemical.searchTerm})};


function determineViscositySutherland(chemicalIdentifier, temperature) {

	// Sutherland's Law
	// CRANE Technical Paper 410
	// mu = mu_o * (0.555*T_o + C) / (0.555*T + C) * (T/T_o)^(3/2)
	// Where: 	mu [cp]					viscosity at temperature T
	//						mu_o [cP]			viscosity at temperature T_o
	//						T [degR]  		absolute temp in degR (degR = 460 + degF) for which viscosity is desired
	//						T_o [degR]		absolute temp in degR for which viscosity is known
	//						S_mu [unitless]	Sutherland's constant

	let chemicalDataObject = selectChemicalDataObject(chemicalIdentifier);

	let T = convertTempToRankine(Number( temperature ), "C");
	let mu_o = chemicalDataObject.sutherland.mu_o.value;
	let T_o = chemicalDataObject.sutherland.T_o.value;
	let S_mu = chemicalDataObject.sutherland.S_mu.value;

	let mu =  mu_o * ( (0.555*T_o+S_mu) / (0.555*T+S_mu) ) * Math.pow(T/T_o,3/2);
	let calculationDetails = "The viscosity of " + chemicalDataObject.name + " at " + temperature.toPrecision(3) + " deg Rankine has been estimated using Sutherland's Law assuming: S_mu (Sutherland's Constant for Viscosity) = " + S_mu + " [source: " + SOURCES.crane.reference + "], and a reference viscosity data point (" + mu_o + " cP at " + T_o + " degR) [" + SOURCES.crc.reference + "].";

	return {"value": mu, "context": calculationDetails}

};

// need to find an original source for this equation, and perhaps the equation for viscosity as well
function determineThermalConductivitySutherland(chemical, temperature) {

	// Sutherland's Law
	// ...
	// k = k_o * (0.555*T_o + C) / (0.555*T + C) * (T/T_o)^(3/2)
	// Where: 	  k [...]				thermal conductivity at temperature T
	//						k_o [...]			thermal conductivity at temperature T_o
	//						T [...]  		absolute temp in degR (degR = 460 + degF) for which viscosity is desired
	//						T_o [...]		absolute temp in degR for which viscosity is known
	//						S_k [unitless]	Sutherland's constant

	let T = temperature
	let mu_o = PROPERTIES[chemical].sutherland.mu_o.value;
	let T_o = PROPERTIES[chemical].sutherland.T_o.value;
	let C = PROPERTIES[chemical].sutherland.C.value;

	let mu =  mu_o * ( (0.555*T_o+C) / (0.555*T+C) ) * Math.pow(T/T_o,3/2);
	let calculationDetails = "chicken";

	return {"value": mu, "context": calculationDetails}

};

function determineVirialCoefficient() {

	//PV/RT = 1 + B/V + C/V^2 + D/V^3 + ...
	//where B [the second virial coefficient] = R*Tc/Pc * (B_o + acentric_factor*B_1)
	//      B_o = 0.083 - 0.422 / T_r^(1.6)
	//      B_1 = 0.139 - 0.172 / T_r^(4.2)
	//      T_r = T / T_c
}


// ==============================
//BELOW COULD BE REPLACED WITH SQL
// ==============================


const notUsedPROPERTIES = [
    {
        "searchTerm": "",
        "cas": "",
        "name": "",
        "molecularWeight": {
            "value": "",
            "source": ""
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "",
                "source": ""
            },
            "T_o": {
                "value": "",
                "source": ""
            },
            "mu_o": {
                "value": "",
                "source": ""
            }
        }
    },
    {
        "searchTerm": "water [7732-18-15]",
        "cas": "7732-18-15",
        "name": "water",
        "molecularWeight": {
            "value": "18.015",
            "source": "polingPrausnitzOConnell"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "",
                "source": ""
            },
            "T_o": {
                "value": "",
                "source": ""
            },
            "mu_o": {
                "value": "",
                "source": ""
            }
        }
    },
    {
        "searchTerm": "oxygen [7782-44-7]",
        "cas": "7782-44-7",
        "name": "oxygen",
        "molecularWeight": {
            "value": "31.999",
            "source": "polingPrausnitzOConnell"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "127",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0207",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "air [132259-10-0]",
        "cas": "132259-10-0",
        "name": "air",
        "molecularWeight": {
            "value": "28.966",
            "source": "hilsenrath"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "120",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0185",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "",
        "cas": "7727-37-9",
        "name": "nitrogen",
        "molecularWeight": {
            "value": "28.014",
            "source": "polingPrausnitzOConnell"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "111",
                "source": "crane"
            },
            "T_o": {
                "value": "",
                "source": ""
            },
            "mu_o": {
                "value": "",
                "source": ""
            }
        }
    }
];

const alsoNotUsedPROPERTIES = [

	// default value to avoid errors when input field has no value
	{searchTerm: "", cas: "", name: "",
		molecularWeight: {value: "", source: ""},
		normalBoilingTemperature: {value: "", source: ""},
		sutherland: {
			S_mu: {value: "", source: ""},
			T_o: {value: "", source: ""},
			mu_o: {value: "", source: ""}
		}
	},

	{searchTerm: "air [132259-10-0]", cas: "132259-10-0", name: "air",
		molecularWeight: {value: 28.966, source: "hilsenrath"},
		normalBoilingTemperature: {value: "", source: ""}, // Air is a mixture
		sutherland: {
			S_mu: {value: 120 /*degR*/, source: "crane"},
			T_o: {value: 520 /*degR*/, source: "crc"},
			mu_o: {value: 0.0185 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "water [7732-18-15]", cas: "7732-18-15", name: "water",
		molecularWeight: {value: 18.015, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: "", source: ""},
			T_o: {value: "", source: ""},
			mu_o: {value: "", source: ""}
		}
	},

	{searchTerm: "oxygen [7782-44-7]", cas: "7782-44-7", name: "oxygen",
		molecularWeight: {value: 31.999, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: 127 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.0207 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "nitrogen [7727-37-9]", cas: "7727-37-9", name: "nitrogen",
		molecularWeight: {value: 28.014, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: 111 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.0179 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "hydrogen [7440-44-0]", cas: "7440-44-0", name: "hydrogen",
		molecularWeight: {value: 2.016, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value:  72 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.0089 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "carbon dioxide [124-38-9]", cas: "124-38-9", name: "carbon dioxide",
		molecularWeight: {value: 44.010, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: 240 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.015 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "carbon monoxide [630-08-0]", cas: "630-08-0", name: "carbon monoxide",
		molecularWeight: {value: 28.010, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: 118 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.0178 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "sulfur dioxide [7446-09-5]", cas: "7446-09-5", name: "sulfur dioxide",
		molecularWeight: {value: 64.065, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: 416 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.0129 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "ammonia (anhydrous) [7664-41-7]", cas: "7664-41-7", name: "ammonia (anhydrous)",
		molecularWeight: {value: 17.031, source: "polingPrausnitzOConnell"},
		sutherland: {
			S_mu: {value: 370 /*degR*/, source: "crane"},
			T_o: {value: 540 /*degR*/, source: "crc"},
			mu_o: {value: 0.0102 /*cP*/, source: "crc"}
		}
	},

	{searchTerm: "ammonia (aqueous, 30%) [1336-21-6]", cas: "1336-21-6", name: "ammonia (aqueous, 30%)",
		molecularWeight: {value: 35.046, source: "crc"},
		sutherland: {
			S_mu: {value: "", source: ""},
			T_o: {value: "", source: ""},
			mu_o: {value: "", source: ""}
		}
	},
];