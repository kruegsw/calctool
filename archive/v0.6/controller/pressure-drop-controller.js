class PressureDropController extends CalcControllerTemplate {
    constructor(objectname)
    {
        super(objectname);

                //this.userDesignFactor
        //this.userMinVelocity 
        //this.userMaxVelocity
        //this.userMinPressure
        //this.userMaxPressure
        this.chemicalPropertySearch = new ChemicalPropertySearch (this, "Chemical Search", "", "", "");
        this.chemicalPropertyName = new ChemicalPropertyName (this, "Chemical", "", "", "lookup");
        this.chemicalPropertyCAS = new ChemicalPropertyCAS (this, "CAS Number", "", "", "lookup");
        this.chemicalPropertyFamily = new ChemicalPropertyFamily (this, "Family", "", "", "lookup");
        this.chemicalPropertyMolecularWeight = new ChemicalPropertyMolecularWeight (this, "Molecular Weight", "", "", "lookup");
        this.chemicalPropertyCriticalPressure = new ChemicalPropertyCriticalPressure (this, "Critical Pressure", "", "psia", "lookup");
        this.chemicalPropertyCriticalTemperature = new ChemicalPropertyCriticalTemperature (this, "Critical Temperature", "", "K", "lookup");
        this.chemicalPropertyCriticalMolarVolume = new ChemicalPropertyCriticalMolarVolume (this, "Critical Molar Volume", "", "cm3/mol", "lookup");
        this.chemicalPropertyCriticalCompressibilityFactor = new ChemicalPropertyCriticalCompressibilityFactor (this, "Critical Compressibility Factor (Zc)", "", "", "lookup");
        this.chemicalPropertyAcentricFactor = new ChemicalPropertyAcentricFactor (this, "Acentric Factor", "", "", "lookup");
        this.chemicalPropertyNormalBoilingTemperature = new ChemicalPropertyNormalBoilingTemperature (this, "Normal Boiling Point", "", "C", "lookup");
        this.chemicalConditionTemperature = new ChemicalConditionTemperature (this, "Temperature", "25", "C", "");
        this.chemicalConditionPressure = new ChemicalConditionPressure (this, "Pressure", "0", "psig", "");
        this.chemicalConditionPhase = new ChemicalConditionPhase (this, "Phase", "", "", "basedOnVaporPressure");
        this.chemicalConditionVaporPressure = new ChemicalConditionVaporPressure (this, "Vapor Pressure", "", "psia", "perryVaporPressureCorrelation");
        this.chemicalConditionSaturationPressure = new ChemicalConditionSaturationPressure (this, "Saturation Pressure", "", "psia", "");
        this.chemicalConditionDensity = new ChemicalConditionDensity (this, "Density", "", "lb/ft3", "idealGas");
        this.chemicalConditionViscosity = new ChemicalConditionViscosity(this, "Absolute (Dynamic) Viscosity", "", defaultUnits("viscosityDynamic"), "perryLiquidCorrelation");       
        this.chemicalConditionCp = new ChemicalConditionCp (this, "Heat Capacity at Constant Pressure (Cp)", "", "BTU/lb/F", "perryLiquidCorrelation");
        this.chemicalConditionCv = new ChemicalConditionCv (this, "Heat Capacity at Constant Volume (Cv)", "", "BTU/lb/F", "");
        this.chemicalConditionCpCvRatio = new ChemicalConditionCpCvRatio (this, "Heat Capacity Ratio Cp/Cv", "", "", "heatCapacityRatio");
        this.chemicalConditionSonicVelocity = new ChemicalConditionSonicVelocity (this, "Sonic Velocity", "", "m/s", "compressible gas");
        this.chemicalConditionStaticPressureOutInRatioForSonicVelocity = new ChemicalConditionStaticPressureOutInRatioForSonicVelocity (this, "Pressure Ratio for Sonic Velocity Po/Pi", "", "", "");
        this.chemicalConditionHeatOfVaporization = new ChemicalConditionHeatOfVaporization (this, "Heat of Vaporization", "", "J/kg", "perryCorrelation");
        this.chemicalConditionThermalConductivity = new ChemicalConditionThermalConductivity (this, "Thermal Conductivity", "", "W/m/K", "perryLiquidCorrelation");

        this.systemPropertyPipeMaterial = new SystemPropertyPipeMaterial(this, "Pipe Material", "Commercial Steel or Wrought Iron", "", "");
        this.systemPropertyPipeStandard = new SystemPropertyPipeStandard(this, "Pipe Standard", "NPS", "", "");
        
        this.systemPropertyPipeAbsoluteRoughness = new SystemPropertyPipeAbsoluteRoughness(this, "Absolute Roughness", "", "ft", "empirical");
        //this.systemPropertyPipeModulusElasticity = new SystemPropertyPipeModulusElasticity(this, "Modulus of Elasticity", "", "", "");
        this.systemPropertyPipeNominalDiameter = new SystemPropertyPipeNominalDiameter(this, "Nominal Diameter", "2", "in", "");
        this.systemPropertyPipeInnerDiameter = new SystemPropertyPipeInnerDiameter(this, "Inner Diameter", "", "in", "fromPipeInfo");
        this.systemPropertyPipeSchedule = new SystemPropertyPipeSchedule(this, "Pipe Schedule", "Sch. 40", "", "");
        this.systemPropertyPipeHydraulicRadius = new SystemPropertyPipeHydraulicRadius(this, "Hydraulic Radius", "", "in", "");
        this.systemPropertyPipeCrossSectionalArea = new SystemPropertyPipeCrossSectionalArea(this, "Pipe Cross Section Area", "", "in2", "calculatefromDiameter");
        this.systemPropertyPipeLength = new SystemPropertyPipeLength(this, "Pipe Length", "100", "ft", "");
        //this.systemPropertyAdditionalK
        //this.systemPropertyAdditionalCv
        this.systemConditionFlowMassRate = new SystemConditionFlowMassRate(this, "Mass Flow Rate", "100", "lb/hr", "");
        this.systemConditionFlowVolumeRate = new SystemConditionFlowVolumeRate(this, "Volume Flow Rate", "", "ft3/h", "massRate/density");
        this.systemConditionReynolds = new SystemConditionReynolds(this, "Reynolds Number", "", "", "craneTPU410");
        this.systemConditionFrictionFactor = new SystemConditionFrictionFactor(this, "Friction Factor", "", "", "colebrooke");
        this.systemConditionVelocity = new SystemConditionVelocity(this, "Velocity", "", "m/s", "volumeRateOverArea");
        //this.systemConditionPressureDropTotal = new SystemConditionPressureDropTotal (this, "Total Pressure Drop", "", "psi", "");
        //this.systemConditionPressureStaticIn
        //this.systemConditionPressureStaticOut
        //this.systemConditionPressureStaticOutInRatio
        this.systemConditionPressureDropPipe = new SystemConditionPressureDropPipe (this, "Pressure Drop (Pipe Only)", "", "psi", "darcy");
        //this.systemConditionPressureDropAdditionalK
        //this.systemConditionPressureDropAdditionalCv
        

    }
}