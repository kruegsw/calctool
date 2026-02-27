// this may require using "cas" as the common id rather than "serachTerm"
let template = {
    "searchTerm": "",
    "cas": "",
    "name": "",
    "synonyms": "", // new
    "family": {
        "value": "",
        "source": ""
    },
    "molecularFormula": {
        "value": "",
        "source": ""
    },
    "molecularWeight": {
        "value": "",
        "source": ""
    },
    "normalBoilingTemperature": {
        "value": "",
        "sublimation": "",
        "source": ""
    },
    "criticalMolarVolume": {
        "value": "",
        "source": ""
    },
    "criticalPressure": {
        "value": "",
        "source": ""
    },
    "criticalTemperature": {
        "value": "",
        "source": ""
    },
    "criticalCompressibilityFactorZc": {
        "value": "",
        "source": ""
    },
    "acentricFactor": {
        "value": "",
        "source": ""
    },
    "enthalpyOfFormation": {
        "value": "",
        "source": ""
    },
    "gibbsEnergyOfFormation": {
        "value": "",
        "source": ""
    },
    "entropy": {
        "value": "",
        "source": ""
    },
    "enthalpyOfCombustion": {
        "value": "",
        "source": ""
    },
    "empirical": {
        "gaseous": {
            "vaporPressure": {
                "perryCorrelation": {
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "C5": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            },
            "viscosity": {
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
                },
                "perryCorrelation": {
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            },
            "thermalConductivity": {
                "perryCorrelation": {
                    "equation": {
                        "value": "",
                        "source": ""
                    },
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            }
        },
        "liquid": {
            "density": {
                "perryCorrelation": {
                    "equation": {
                        "value": "",
                        "source": ""
                    },
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "C5": {
                        "value": "",
                        "source": ""
                    },
                    "C6": {
                        "value": "",
                        "source": ""
                    },
                    "C7": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            },
            "heatVaporization": {
                "perryCorrelation": {
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            },
            "cp": {
                "perryCorrelation": {
                    "equation": {
                        "value": "",
                        "source": ""
                    },
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "C5": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            },
            "thermalConductivity": {
                "perryCorrelation": {
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "C5": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            },
            "viscosity": {
                "perryCorrelation": {
                    "equation": {
                        "value": "",
                        "source": ""
                    },
                    "C1": {
                        "value": "",
                        "source": ""
                    },
                    "C2": {
                        "value": "",
                        "source": ""
                    },
                    "C3": {
                        "value": "",
                        "source": ""
                    },
                    "C4": {
                        "value": "",
                        "source": ""
                    },
                    "C5": {
                        "value": "",
                        "source": ""
                    },
                    "Tmin": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmin": {
                        "value": "",
                        "source": ""
                    },
                    "Tmax": {
                        "value": "",
                        "source": ""
                    },
                    "valueAtTmax": {
                        "value": "",
                        "source": ""
                    }
                }
            }
        }
    },
    "theoretical": {}
}