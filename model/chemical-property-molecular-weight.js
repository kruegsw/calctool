class ChemicalPropertyMolecularWeight extends FlowModelTemplate {
    constructor(parent, label, user, unitsValue, method,)
    {
        super(parent, label, user, unitsValue, method, "chemicalPropertyMolecularWeight");

        this.units.quantity = "";

        this.methods = {
            lookup: {
                label: "",
                input: ["chemicalPropertyCAS"],
                source: "",
                get calculation() {
                    let chemicalDataObject = selectChemicalDataObject(parent.chemicalPropertyCAS.value);
                    return chemicalDataObject.molecularWeight.value;
                },
            },

            // due to the "get storm" that occurs when the calculation updates, APIs may not be practical...
            // would need to find a way to prevent (a) API recalculation and (b) updating form when async data arrives
            /*
            apiNIST: { // https://github.com/oscarcontrerasnavas/nist-webbook-scrapyrt-spider
                label: "NIST API",
                input: ["chemicalPropertyCAS"],
                source: "nist",
                get calculation() {
                    console.log("entered method apiNist");
                    async () => {
                        let response = await fetch(`https://nist-api.fly.dev/crawl.json?spider_name=webbook_nist&start_requests=true&crawl_args={%22search_by%22:%22cas%22,%20%22cas%22:%${parent.chemicalPropertyCAS.value}%22}`);
                        console.log(`https://nist-api.fly.dev/crawl.json?spider_name=webbook_nist&start_requests=true&crawl_args={%22search_by%22:%22cas%22,%20%22cas%22:%${parent.chemicalPropertyCAS.value}%22}`);
                        let json = await response.json(); //extract JSON from the http response
                        console.log(json);
                        return json.items[0].molecular_weight;
                    }
                    let cas = parent.chemicalPropertyCAS.value;
                    let mw = "";
                    async function getMW(cas, mw) { //works
                        let url = "https://nist-api.fly.dev/crawl.json?spider_name=webbook_nist&start_requests=true&crawl_args={%22search_by%22:%22cas%22,%20%22cas%22:%22"+`${cas}`+"%22}";
                        await fetch(url, mw)
                            .then((response) => response.json())
                            .then((data) => data.items[0] ? mw = data.items[0].molecular_weight : mw = "")
                    };
                    getMW(cas, mw);
                    return mw;
                    
                    let cas = parent.chemicalPropertyCAS.value;
                    let mw = "";
                    (async () => { //works
                        let url = "https://nist-api.fly.dev/crawl.json?spider_name=webbook_nist&start_requests=true&crawl_args={%22search_by%22:%22cas%22,%20%22cas%22:%22"+`${cas}`+"%22}";
                        await fetch(url)
                            .then((response) => response.json())
                            //.then((data) => data.items[0] ? mw = data.items[0].name = data : "")
                            .then((data) => console.log(data))
                            .then((data) => mw = data.items[0].molecular_weight)
                    })();
                    return mw
                }
            },
            apiAsyncNIST: { 
                label: "Asynchronous NIST API",
                input: ["chemicalPropertyCAS"],
                source: "nist",
                get calculation() {
                    return (async () => {console.log("entered method asynchronous apiNist");
                        let cas = parent.chemicalPropertyCAS.value;
                        let mw = "";
                        await (async (mw) => { //works
                            let url = "https://nist-api.fly.dev/crawl.json?spider_name=webbook_nist&start_requests=true&crawl_args={%22search_by%22:%22cas%22,%20%22cas%22:%22"+`${cas}`+"%22}";
                            await fetch(url, mw)
                                .then((response) => response.json())
                                .then((data) => console.log(data))
                                .then((data) => mw = data.items[0].molecular_weight)
                        })();
                        return mw
                    })()
                }
            }
            */
        };
    }
}