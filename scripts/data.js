const PROPERTIES = [
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
                "value": "520",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0185",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "water [7732-18-15]",
        "cas": "7732-18-15",
        "name": "water",
        "molecularWeight": {
            "value": "18.015",
            "source": "poling"
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
            "source": "poling"
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
        "searchTerm": "nitrogen [7727-37-9]",
        "cas": "7727-37-9",
        "name": "nitrogen",
        "molecularWeight": {
            "value": "28.014",
            "source": "poling"
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
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0179",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "hydrogen [7440-44-0]",
        "cas": "7440-44-0",
        "name": "hydrogen",
        "molecularWeight": {
            "value": "2.016",
            "source": "poling"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "72",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0089",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "carbon dioxide [124-38-9]",
        "cas": "124-38-9",
        "name": "carbon dioxide",
        "molecularWeight": {
            "value": "44.01",
            "source": "poling"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "240",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.015",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "carbon monoxide [630-08-0]",
        "cas": "630-08-0",
        "name": "carbon monoxide",
        "molecularWeight": {
            "value": "28.01",
            "source": "poling"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "118",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0178",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "sulfur dioxide [7446-09-5]",
        "cas": "7446-09-5",
        "name": "sulfur dioxide",
        "molecularWeight": {
            "value": "64.065",
            "source": "poling"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "416",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0129",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "ammonia (anhydrous) [7664-41-7]",
        "cas": "7664-41-7",
        "name": "ammonia (anhydrous)",
        "molecularWeight": {
            "value": "17.031",
            "source": "poling"
        },
        "normalBoilingTemperature": {
            "value": "",
            "source": ""
        },
        "sutherland": {
            "S_mu": {
                "value": "370",
                "source": "crane"
            },
            "T_o": {
                "value": "540",
                "source": "crc"
            },
            "mu_o": {
                "value": "0.0102",
                "source": "crc"
            }
        }
    },
    {
        "searchTerm": "ammonia (aqueous, 30%) [1336-21-6]",
        "cas": "1336-21-6",
        "name": "ammonia (aqueous, 30%)",
        "molecularWeight": {
            "value": "35.046",
            "source": "crc"
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
    }
]

