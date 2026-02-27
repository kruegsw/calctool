# Pressure Drop Calculator - Technical Reference

This document describes the data sources, calculation methods, assumptions, default selections, and known limitations of the pressure drop calculator.

---

## Table of Contents

1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Chemical Properties](#chemical-properties)
4. [Phase Determination](#phase-determination)
5. [Pipe Configuration](#pipe-configuration)
6. [Flow Calculations](#flow-calculations)
7. [Friction Factor Methods](#friction-factor-methods)
8. [Pressure Drop Calculations](#pressure-drop-calculations)
9. [Compressible Flow](#compressible-flow)
10. [Fittings Loss Methods](#fittings-loss-methods)
11. [Solver Behavior](#solver-behavior)
12. [Unit System](#unit-system)
13. [Potential Issues and Limitations](#potential-issues-and-limitations)
14. [Future Improvements (Compressible Flow)](#future-improvements-compressible-flow)
15. [References](#references)

---

## Overview

This calculator estimates pressure drop for single-phase pipe flow using the Darcy-Weisbach equation as its foundation, with extensions for compressible gas flow (Fanno adiabatic and isothermal methods). It covers:

- 365 chemicals with temperature-dependent property correlations from Perry's Chemical Engineers' Handbook (9th ed.)
- 8 friction factor methods spanning laminar through turbulent regimes
- 3 pressure drop methods: incompressible (Darcy-Weisbach), adiabatic compressible (Fanno), and isothermal compressible
- 40 pipe fittings with both fixed K-factor (Crane) and Reynolds-dependent 3-K (Darby) loss coefficients
- 12 pipe materials with Moody-chart roughness values
- 139 pipe dimension entries across NPS, DN, and tube standards

All internal calculations are performed in SI units. Conversion to display units occurs only at the input/output boundary.

---

## Data Sources

### Chemical Database

**Source**: Perry's Chemical Engineers' Handbook, 9th Edition (2018)

The chemical database contains 365 chemicals, each with:

- **Identification**: Name, CAS number, chemical family
- **Constant properties**: Molecular weight, critical temperature (Tc), critical pressure (Pc), critical compressibility factor (Zc), acentric factor, normal boiling temperature, critical molar volume
- **Temperature-dependent correlations**: Empirical curve fits for vapor pressure, liquid density, liquid/gas viscosity, liquid/gas heat capacity, liquid/gas thermal conductivity, and heat of vaporization

Each correlation is stored with its equation type, coefficients (C1-C7), and valid temperature range (Tmin, Tmax).

#### Perry Correlation Equation Forms

| Equation | Form | Typical Use |
|----------|------|-------------|
| 100 | C1 + C2T + C3T^2 + C4T^3 + C5T^4 | Liquid/gas Cp, viscosity, thermal conductivity |
| 101 | exp(C1 + C2/T + C3 ln T + C4 T^C5) | Vapor pressure, liquid viscosity |
| 102 | C1 T^C2 / (1 + C3/T + C4/T^2) | Gas viscosity, gas thermal conductivity |
| 105 | C1 / C2^(1 + (1 - T/C3)^C4) | Liquid density (Rackett equation) |
| 107 | C1 + C2 (C3/T / sinh(C3/T))^2 + C4 (C5/T / cosh(C5/T))^2 | Ideal-gas Cp (Aly-Lee / DIPPR) |
| 114 | C1^2/tau + C2 - 2 C1 C3 tau - ... (see below) | Liquid Cp (DIPPR specialized) |
| "2-119" | C1 + C2 tau^(1/3) + C3 tau^(2/3) + ... (tau power series) | Liquid density (alternative to Rackett) |

**Equation 114** (full form): Cp = C1^2/tau + C2 - 2 C1 C3 tau - C1 C4 tau^2 - C3^2 tau^3/3 - C3 C4 tau^4/2 - C4^2 tau^5/5, where tau = 1 - T/Tc.

**Equation "2-119"** (full form): rho = C1 + C2 tau^(1/3) + C3 tau^(2/3) + C4 tau^(5/3) + C5 tau^(16/3) + C6 tau^(46/3) + C7 tau^(110/3), where tau = 1 - T/Tc.

### Pipe Dimensions

**Sources**: Piping Handbook, 7th Edition (Nayyar, 2000); Copper Tube Handbook (Copper Development Association)

- 139 entries covering NPS (1/2" through 24"), DN (15 mm through 600 mm), and copper/other tube standards
- Each entry provides outer diameter and wall thickness for each available schedule
- Inner diameter is computed as ID = OD - 2 x wall thickness

### Pipe Materials

**Source**: Moody chart data / Crane TP-410

12 materials with absolute roughness values:

| Material | Roughness (m) |
|----------|--------------|
| Drawn Tubing / Smoothest Possible | 0.000005 |
| Commercial Steel / Wrought Iron | 0.00015 |
| Asphalted Cast Iron | 0.0004 |
| Galvanized Iron | 0.0005 |
| Cast Iron | 0.00085 |
| Concrete (smooth) | 0.001 |
| Wood Stave (smooth) | 0.0006 |
| Wood Stave (rough) | 0.003 |
| Riveted Steel (smooth) | 0.003 |
| Concrete (rough) | 0.01 |
| Riveted Steel (rough) | 0.03 |

### Fittings

**Sources**: Crane TP-410 (fixed K-factors); Darby (2001) (3-K coefficients)

40 fittings across 6 categories: elbows, tees, valves, reducers/enlargements, entrances/exits, and miscellaneous. Each fitting has a fixed K-factor. Most also have 3-K Darby coefficients (k1, ki, kd) for Reynolds-dependent loss estimation.

---

## Chemical Properties

### Thermodynamic Properties

All thermodynamic properties are evaluated at the user-specified temperature and pressure. The active calculation method depends on phase (see [Phase Determination](#phase-determination)).

| Property | Liquid Method | Gas/Vapor Method | Equation |
|----------|--------------|------------------|----------|
| Density | Perry liquid correlation (eq 105 or "2-119") | Ideal gas law: rho = P MW / (R T) | See below |
| Viscosity | Perry liquid correlation (eq 101 or 100) | Sutherland's law (preferred) or Perry vapor correlation (eq 102) | See below |
| Heat capacity (Cp) | Perry liquid correlation (eq 100 or 114) | Perry vapor correlation (eq 100) | See below |
| Thermal conductivity | Perry liquid correlation (eq 100 or 101) | Perry vapor correlation (eq 102 or 100) | See below |
| Heat of vaporization | Perry correlation (all phases) | Same | Eq 106-style |

#### Density

**Liquid** - Perry correlation using either the Rackett equation (eq 105) or a tau power series (eq "2-119"), returning molar density which is multiplied by molecular weight to get kg/m^3. Assumes incompressible liquid at saturation; pressure effects on liquid density are neglected.

**Gas/Vapor** - Ideal gas law: rho = P * MW / (R * T), where P is absolute pressure in Pa, MW in kg/mol, R = 8.314 J/(mol K), T in K. Assumes compressibility factor Z = 1. Accuracy degrades near the critical point and at high pressures.

#### Viscosity

**Liquid** - Perry liquid correlation, typically equation 101 (exponential form) or 100 (polynomial). Assumes saturated liquid; pressure effects neglected.

**Gas/Vapor** - Preferred method is Sutherland's law when coefficients are available: mu = mu_0 * ((T_0 + S) / (T + S)) * (T / T_0)^1.5, where T_0 is the reference temperature, mu_0 is the reference viscosity, and S is the Sutherland constant. Falls back to Perry vapor correlation (eq 102) otherwise. Both assume dilute gas at low to moderate pressure.

#### Heat Capacity (Cp)

**Liquid** - Perry liquid correlation using equation 114 (DIPPR specialized) or equation 100 (polynomial). Returns molar Cp in J/(kmol K), divided by MW to get J/(kg K). Assumes saturated liquid; no pressure correction.

**Gas/Vapor** - Perry vapor correlation using equation 100 (polynomial in temperature). Returns ideal-gas Cp in J/(kmol K), divided by MW. Assumes ideal gas (Cp independent of pressure).

**Cv** is computed as Cv = Cp - R/MW, assuming ideal gas behavior. The ratio gamma = Cp/Cv is used in compressible flow calculations.

#### Sonic Velocity

Computed as c = sqrt(gamma * R * T / MW_kg), where gamma = Cp/Cv, R = 8.314 J/(mol K), T in K, MW in kg/mol. This assumes an ideal gas with constant Cp/Cv ratio. Source: Crane TP-410.

#### Prandtl Number

Computed as Pr = Cp * mu / k (heat capacity times dynamic viscosity divided by thermal conductivity). Dimensionless.

---

## Phase Determination

Phase is determined by comparing vapor pressure to operating pressure:

1. If vapor pressure > critical pressure: **gas** (supercritical; substance cannot be liquefied at this temperature regardless of pressure)
2. If vapor pressure > operating pressure: **vapor** (below boiling point at this pressure, but subcritical)
3. Otherwise: **liquid**

This is a simplification that does not account for mixtures or two-phase flow. It uses the Antoine/Perry vapor pressure correlation evaluated at the operating temperature.

**Phase drives automatic method selection**: density, viscosity, heat capacity, and thermal conductivity all switch between liquid and gas/vapor correlations based on phase.

---

## Pipe Configuration

### Inner Diameter

Looked up from pipe dimension tables using the selected standard (NPS/DN/tube), nominal diameter, and schedule. Computed as:

    ID = OD - 2 * wall_thickness

Can be overridden by the user for non-standard pipes.

### Absolute Roughness

Looked up from the pipe materials table. The roughness value is the height of surface irregularities and is used in friction factor calculations via the relative roughness epsilon/D. Can be overridden by the user.

### Hydraulic Radius

For circular pipes: Rh = D/4. Currently only circular cross-sections are supported.

---

## Flow Calculations

### Volume Flow Rate

    Q = W / (rho * 3600)

where W is mass flow rate in kg/hr and rho is density in kg/m^3.

### Velocity

    v = Q / A

where Q is volumetric flow rate in m^3/s and A is pipe cross-sectional area in m^2.

### Mach Number

    Ma = v / c

where v is flow velocity and c is sonic velocity. Mach number determines whether compressible flow corrections are applied (see [Compressible Flow](#compressible-flow)).

### Reynolds Number

    Re = rho * v * D / mu

where rho is density (kg/m^3), v is velocity (m/s), D is inner diameter (m), and mu is dynamic viscosity (Pa s). Reynolds number determines the flow regime:

- Re < 2300: Laminar flow
- 2300 < Re < 4000: Transitional flow
- Re > 4000: Turbulent flow

---

## Friction Factor Methods

The calculator provides 8 friction factor methods. All return the **Darcy** friction factor (not Fanning; f_Darcy = 4 * f_Fanning).

### Churchill 1977 (Default)

**Selected by default** because it is the only single equation that spans all flow regimes (laminar, transitional, and turbulent) without discontinuity.

    A = [-2.457 ln((7/Re)^0.9 + 0.27 epsilon/D)]^16
    B = (37530/Re)^16
    f = 8 [(8/Re)^12 + 1/(A+B)^1.5]^(1/12)

Source: Churchill, S.W. (1977). Valid for all Reynolds numbers and relative roughnesses.

### Laminar (64/Re)

    f = 64 / Re

Exact solution for fully developed laminar flow in a circular pipe. Only valid for Re < 2300.

### Colebrook (Iterative)

Implicit equation solved by 10 iterations of successive substitution:

    1/sqrt(f) = -2 log10(epsilon/(3.7D) + 2.51/(Re sqrt(f)))

The benchmark against which all explicit approximations are compared. Source: Colebrook (1939). Valid for turbulent flow only.

### Churchill 1973

    x = -2 log10(epsilon/(D*3.71) + (7/Re)^0.9)
    f = 1/x^2

Explicit Colebrook approximation. Source: Churchill (1973). Not accurate in laminar or transitional regimes.

### Niazkar (2019)

High-accuracy explicit approximation to the Colebrook equation. Source: Niazkar (2019). Turbulent flow only.

### Swamee-Jain (1976)

    x = log10(epsilon/(3.7D) + 5.74/Re^0.9)
    f = 0.25/x^2

Explicit approximation accurate to ~1%. Valid for Re 5000-10^8, epsilon/D 10^-6 to 5x10^-2. Source: Swamee and Jain (1976).

### Haaland (1983)

    x = -1.8 log10((epsilon/(3.7D))^1.11 + 6.9/Re)
    f = 1/x^2

Explicit approximation accurate to ~1.5%. Turbulent flow only. Source: Haaland (1983).

### Moody (1947)

    f = 0.0055 (1 + (20000 epsilon/D + 10^6/Re)^(1/3))

Legacy method with lower accuracy than modern approximations. Turbulent flow only. Source: Moody (1947).

### Cheng (2008)

Complex explicit formula valid across laminar, transitional, and turbulent regimes. Source: Cheng (2008).

---

## Pressure Drop Calculations

### Darcy-Weisbach (Incompressible)

The fundamental pressure drop equation for steady-state, fully developed, incompressible flow in a circular pipe:

    dP = f * (L/D) * rho * v^2 / 2

where f is the Darcy friction factor, L is pipe length, D is inner diameter, rho is fluid density, and v is flow velocity.

**Assumptions**:
- Steady-state flow
- Incompressible fluid (constant density along pipe length)
- Fully developed flow profile
- Circular cross-section
- Constant pipe diameter

**When used**: Default for all liquid flows. Default for gas flows when Mach < 0.3. Source: Crane TP-410.

### Fanno (Adiabatic Compressible)

For gas flows where compressibility effects are significant (Ma > 0.3), the Fanno line analysis accounts for density and velocity changes along the pipe length under adiabatic conditions.

**Procedure**:

1. Compute the Fanno parameter at the inlet Mach number:

        Phi(Ma, gamma) = (1 - Ma^2) / (gamma * Ma^2)
            + (gamma + 1) / (2 gamma) * ln[(gamma + 1) Ma^2 / (2 + (gamma - 1) Ma^2)]

2. Compute the Fanno parameter at the outlet:

        Phi_2 = Phi_1 - f * L / D

3. Solve for the outlet Mach number Ma_2 by inverting the Fanno parameter (bisection method, 50 iterations).

4. Compute the pressure ratio:

        P2/P1 = (Ma1/Ma2) * sqrt[(2 + (gamma-1) Ma1^2) / (2 + (gamma-1) Ma2^2)]

5. Pressure drop:

        dP = P1 * (1 - P2/P1)

**Assumptions**:
- Adiabatic (no heat transfer through pipe walls)
- Constant cross-section (uniform diameter)
- Subsonic inlet (Ma < 1)
- Ideal gas with constant gamma
- Fully developed flow; friction factor constant along length

**Choking**: Flow becomes choked (Ma_2 = 1) when Phi_2 <= 0, meaning the pipe length exceeds the maximum Fanno length L*.

**When used**: Automatically selected for gas/vapor flows when Ma > 0.3. Source: Crane TP-410.

### Isothermal Compressible

For gas flows under isothermal conditions (temperature held constant, e.g., by heat transfer through pipe walls):

**Procedure**:

1. Compute the choking limit: Ma_choke = 1/sqrt(gamma).
2. Compute the maximum f*L/D for the inlet Mach number.
3. Solve for the pressure ratio r = P2/P1 satisfying:

        f * L / D = (1 / (gamma * Ma1^2)) * (1 - r^2) - 2 ln(r)

    using bisection.

4. Pressure drop: dP = P1 * (1 - r).

**Assumptions**:
- Isothermal (constant temperature along pipe)
- Constant cross-section
- Subsonic inlet
- Ideal gas with constant gamma

**When used**: Can be manually selected by the user as an alternative to Fanno. Source: Crane TP-410.

### Fanno Maximum Length (L*)

The maximum pipe length before flow chokes under adiabatic Fanno conditions:

    L* = D * Phi(Ma, gamma) / f

This is a diagnostic property. Warnings are issued when:
- Pipe length >= 100% of L*: "Flow is choked"
- Pipe length >= 80% of L*: "Approaching choked flow"

### Pressure Drop (Total)

The total pressure drop is the sum of pipe friction losses and fittings losses:

    dP_total = dP_pipe + dP_fittings

The calculator automatically selects the appropriate method:
- **pipeAndFittings**: Used when fittings are present (K > 0 and pressureDropFittings is valid)
- **pipeOnly**: Used when no fittings are present, or when pressureDropFittings cannot be computed (e.g., when pressureDropPipe is user-overridden and upstream properties like density/velocity are unavailable)

---

## Compressible Flow

### Automatic Method Selection

The calculator automatically switches to compressible flow methods based on Mach number:

| Condition | pressureDropPipe Method | Reason |
|-----------|------------------------|--------|
| Liquid (any Ma) | Darcy-Weisbach | Liquids are incompressible |
| Gas/vapor, Ma <= 0.3 | Darcy-Weisbach | Compressibility effects < ~5%, negligible |
| Gas/vapor, Ma > 0.3 | Fanno (adiabatic) | Density change along pipe becomes significant |

The Ma = 0.3 threshold is a standard engineering guideline. Below this, incompressible analysis introduces less than ~5% error. Above it, the density and velocity change appreciably along the pipe and the Darcy-Weisbach equation (which assumes constant density) becomes increasingly inaccurate.

Users can override the automatic selection and manually choose any method (darcy, fanno, or isothermal) via the method selector.

### Fanno vs. Isothermal

| Aspect | Fanno (Adiabatic) | Isothermal |
|--------|-------------------|------------|
| Heat transfer | None (perfectly insulated) | Enough to maintain constant T |
| Choking Mach | 1.0 | 1/sqrt(gamma) ~ 0.845 for air |
| Typical application | Short to moderate pipe lengths, well-insulated | Long pipe runs where heat exchange with surroundings maintains temperature |
| Default? | Yes (auto-selected) | No (manual selection) |

In practice, most real pipes fall somewhere between these two idealized limits. Fanno (adiabatic) is the default because it is the more conservative assumption for typical industrial pipe lengths — it predicts a higher pressure drop than isothermal for the same conditions.

### Warnings

The calculator issues the following compressible flow warnings:

- **Ma > 0.3 with compressible method active**: Informational; confirms the compressible method is being used
- **Ma > 0.3 without compressible method**: Warns user that compressibility may be significant and suggests the Fanno method
- **Ma > 1.0**: "Velocity exceeds sonic velocity — results unreliable" (supersonic flow is not modeled)
- **Pipe length >= 80% of Fanno L***: "Approaching choked flow"
- **Pipe length >= 100% of Fanno L***: "Flow is choked — pipe exceeds Fanno max length"

---

## Fittings Loss Methods

### K-Factor Method

Fittings losses are computed using the resistance coefficient (K-factor) method:

    dP_fittings = K_total * rho * v^2 / 2

where K_total is the sum of all individual fitting K-factors times their quantities.

Two methods are available for determining K values:

### Fixed K (Crane)

Each fitting has a single fixed K-factor from Crane TP-410. These are conservative values that do not depend on Reynolds number or pipe size.

**Advantages**: Simple, no iteration required, always available.

**Limitations**: Does not account for Reynolds number or pipe diameter effects. Tends to overestimate losses for large pipes and high Reynolds numbers.

### 3-K Method (Darby)

Reynolds-dependent and diameter-dependent K-factor:

    K = k1/Re + ki * (1 + kd / D_nom^0.3)

where k1, ki, kd are fitting-specific coefficients, Re is the Reynolds number, and D_nom is the nominal pipe diameter in inches.

**Advantages**: More accurate across a range of Reynolds numbers and pipe sizes.

**Limitations**: Requires two-pass solve (first pass computes Re, second pass recomputes K with the fresh Re). Not all fittings have 3-K coefficients; those without fall back to fixed K.

Source: Darby, R. (2001). "Correlate Pressure Drops Through Fittings." Chemical Engineering, 108(4), 127-130.

---

## Solver Behavior

### Evaluation Order

Properties are evaluated in topological (dependency) order using Kahn's algorithm. Each property is computed exactly once per pass, using the results of its upstream dependencies.

### Multi-Pass Auto-Selection

The solver runs up to 3 passes:

1. **First pass**: Evaluate all properties with initial method selections
2. **Phase auto-selection**: After the first pass, the computed phase triggers method switches for density, viscosity, Cp, and thermal conductivity (liquid vs. gas correlations)
3. **Mach auto-selection**: After re-evaluation, the computed Mach number may trigger a switch to Fanno for pressureDropPipe, and the computed pressureDropFittings determines whether pressureDropTotal uses pipeAndFittings or pipeOnly
4. **Re-evaluation**: Any properties downstream of a method change are re-evaluated

User-pinned method selections (where the user has explicitly chosen a method) are never overridden by auto-selection.

### 3-K Two-Pass Solve

When the 3-K fittings method is active and fittings are present, the UI layer performs an additional two-pass solve:

1. First solve: computes Reynolds number
2. Recompute K-factors using 3-K formula with fresh Re
3. If K changed, re-solve with updated totalKFactor

### Post-Solve Validation

After all calculations, the solver checks for physically unreasonable or warning-worthy conditions:

- **Mach > 1**: Supersonic flow not modeled
- **Mach > 0.3**: Compressibility advisory
- **Choking**: Pipe length vs. Fanno L*
- **Cavitation**: Operating pressure below vapor pressure
- **Near-critical**: Temperature within 5% of critical temperature (ideal gas unreliable)
- **Negative density**: Non-physical result
- **Negative Re**: Check flow direction
- **Extrapolation**: Temperature outside Perry correlation valid range

### User Overrides

Any property marked `allowUserOverride` can be pinned to a user-entered value. When overridden:

- The property returns the user's value (converted to SI) instead of computing from its method
- Downstream properties use the overridden value as input
- Upstream properties that would normally feed into the overridden property show a "bypassed" badge
- Clearing the override (emptying the input) reverts to the calculated value

---

## Unit System

### Supported Presets

| Quantity | SI Default | Imperial Default |
|----------|-----------|-----------------|
| Temperature | C | F |
| Pressure | kPa (abs) | psia |
| Pressure difference | kPa | psi |
| Length | m | ft |
| Area | m^2 | ft^2 |
| Velocity | m/s | ft/s |
| Mass flow rate | kg/hr | lb/hr |
| Volume flow rate | m^3/h | gpm |
| Density | kg/m^3 | lb/ft^3 |
| Viscosity | Pa s | centipoise |
| Heat capacity | J/(kg K) | BTU/(lb F) |
| Thermal conductivity | W/(m K) | W/(m K) |
| Specific energy | J/kg | BTU/lb |

Individual unit selectors can be changed independently of the system preset. The unit system setting persists in localStorage.

### Special Units

- **SCFH / SCFM** (Standard Cubic Feet per Hour / Minute): Conditional mass flow rate units that only appear when air is selected. These are volumetric flow rates at standard conditions (60 F, 14.696 psia) converted to mass flow rate using the standard density of air.
- **psig** (Gauge pressure): Converted to absolute by adding 101,325 Pa (1 atm). All internal calculations use absolute pressure.

---

## Potential Issues and Limitations

### Single-Phase Only

This calculator assumes single-phase flow throughout. It does not model:
- Two-phase (gas-liquid) flow
- Flashing flow (liquid vaporizing due to pressure drop)
- Condensing flow

If the calculated pressure drop is large enough that the downstream pressure falls below the vapor pressure, the flow may flash to two-phase. The calculator warns about cavitation risk (operating pressure below vapor pressure) but does not model the two-phase pressure drop that would result. Users should verify that the downstream pressure (inlet pressure minus calculated pressure drop) remains above the vapor pressure for liquids, or check for condensation in gas/vapor systems.

### Ideal Gas Assumption

Gas and vapor density is calculated using the ideal gas law (compressibility factor Z = 1). This assumption is valid for:
- Low to moderate pressures (well below critical pressure)
- Temperatures well above the critical temperature

The calculator warns when temperature is within 5% of the critical temperature. However, even without this warning, accuracy may be reduced at high pressures or for gases with strong intermolecular forces (e.g., steam, ammonia, CO2 near critical conditions). For high-accuracy work with non-ideal gases, users should override the density property with a value from a more rigorous equation of state (Peng-Robinson, SRK, etc.).

### Incompressible Fittings in Compressible Flow

**The K-factor method used for fittings losses always uses the incompressible equation dP = K rho v^2 / 2, evaluated at inlet conditions, regardless of whether a compressible method is active for pipe losses.**

When the Fanno or isothermal method is active for pipe pressure drop, the pipe calculation properly accounts for density and velocity changing along the pipe length. However, the fittings loss calculation does not. It uses the inlet density and inlet velocity as if the fluid properties were constant.

For most practical cases this is acceptable because:
- Individual fittings are short flow elements where density change across the fitting is small
- The K-factor method itself is already an approximation (empirical coefficients, +-20-30% typical accuracy)

However, at high Mach numbers (Ma > 0.5) or in systems with many fittings distributed along a long pipe, the cumulative error may become significant. The actual density and velocity at each fitting location would differ from the inlet values, and fittings further downstream would experience higher velocities and lower densities than assumed.

### Undetected Choking at Fittings and Valves

**The choking analysis (Fanno maximum length) assumes a constant pipe diameter along the entire flow path. It does not account for flow area restrictions at valves, regulators, orifices, or other fittings with internal passages smaller than the surrounding pipe.**

Many common piping components have internal flow areas significantly smaller than the nominal pipe size:
- **Control valves and regulators**: Internal trim passages may be 30-70% of the nominal pipe area
- **Ball valves (reduced port)**: Bore is typically one pipe size smaller than nominal
- **Check valves**: Disc, seat, and body passages restrict flow
- **Strainers**: Screen area may be smaller than pipe area
- **Orifice plates**: By design, these restrict flow area

At these restrictions, the local velocity increases and the local Mach number is higher than the pipe Mach number. A flow that is safely subsonic in the pipe (e.g., Ma = 0.6) could reach sonic conditions at a valve or fitting with a sufficiently small internal passage. This would cause choking at the fitting — a condition that this calculator does not detect.

**Recommendation**: For gas flows at Mach numbers above 0.3, independently verify that the local Mach number at each significant restriction (valve, regulator, orifice) remains safely below 1.0. The local Mach number scales approximately with the area ratio:

    Ma_local ~ Ma_pipe * (A_pipe / A_restriction)

### Constant Friction Factor Along Pipe Length

In compressible flow, the Reynolds number changes along the pipe as density and velocity change. The friction factor therefore also changes along the pipe. This calculator uses a single friction factor computed at inlet conditions for the entire pipe length. This is standard engineering practice (Crane TP-410) but introduces some error, particularly for long pipes with large pressure drops where conditions change significantly from inlet to outlet.

### Steady-State Assumption

All calculations assume steady-state, fully developed flow. Transient effects (startup, shutdown, slug flow, pressure surges / water hammer) are not modeled. Entry-length effects in short pipes are not accounted for — the friction factor assumes fully developed flow throughout.

### Circular Pipe Only

Only circular cross-sections are currently supported. Non-circular ducts (rectangular, annular, etc.) would require a hydraulic diameter correction. The hydraulic radius property (Rh = D/4) is computed but is only the circular-pipe form.

### Liquid Density Pressure Independence

Liquid density is computed from temperature-dependent Perry correlations at saturation conditions. The effect of pressure on liquid density (compressibility) is neglected. For most liquids at moderate pressures this is a very small error, but it may become meaningful at very high pressures (e.g., > 100 bar) or for liquids near their critical point.

### Heat Capacity and Viscosity Pressure Independence

Like liquid density, gas/vapor Cp is computed assuming ideal gas (independent of pressure). Liquid viscosity is computed at saturation conditions. Pressure corrections are not applied. These are standard approximations for engineering estimates but may introduce error at very high pressures.

### Perry Correlation Extrapolation

The Perry correlations have defined valid temperature ranges (Tmin-Tmax). The calculator warns when operating outside this range but does not prevent calculation. Extrapolation beyond the valid range may produce physically unreasonable results (negative density, extremely high viscosity, etc.).

### Pure Components Only

The chemical database contains pure component properties only. Mixtures are not supported. For mixtures, users would need to estimate effective properties externally and override the relevant properties (density, viscosity, Cp, etc.).

### Pipe Roughness as a Constant

Pipe roughness values represent new, clean pipe. Fouling, scaling, corrosion, and biological growth can significantly increase the effective roughness over time. For aged or fouled pipes, users should override the roughness value with an appropriate estimate.

---

## Future Improvements (Compressible Flow)

The following enhancements to compressible flow handling are planned but not yet implemented.

### Expose Outlet Conditions

The Fanno and isothermal solvers already compute outlet Mach number (Ma2) and pressure ratio (P2/P1) internally, but discard these values after computing the pressure drop. Exposing Ma2, P2, rho2, and v2 as calculated properties would give users visibility into how conditions change along the pipe — particularly useful for verifying that downstream equipment ratings are met and for sizing downstream piping.

### Local Mach Number at Fittings

As noted in [Undetected Choking at Fittings and Valves](#undetected-choking-at-fittings-and-valves), the calculator does not check for sonic conditions at flow restrictions. Adding effective area ratios to the fittings database (e.g., reduced-port ball valves at ~60% of pipe area, control valve trim passages at 30-70%) would allow the calculator to estimate the local Mach number at each restriction and warn when choking is likely. This would extend the current choking analysis beyond straight pipe to the components most prone to choking in practice.

### Maximum Mass Flow Rate at Choking

When choking is detected (pipe length exceeds Fanno L*, or local Ma reaches 1.0 at a restriction), the calculator could back-calculate and display the maximum mass flow rate that the system can sustain. This is the flow rate at which the outlet (or restriction) just reaches sonic conditions. Displaying this value alongside the choking warning would give users an immediate sense of how far over the limit they are and what flow rate the system can actually deliver.

---

## References

1. Perry, R.H., Green, D.W. and Southard, M.Z. (2018). *Perry's Chemical Engineers' Handbook*, 9th Edition. McGraw-Hill Education.
2. Crane Co. (1988). *Flow of Fluids Through Valves, Fittings, and Pipe*, Technical Paper No. 410.
3. Churchill, S.W. (1977). "Friction factor equation spans all fluid flow regimes." *Chemical Engineering*, 91, 91-92.
4. Churchill, S.W. (1973). "Empirical Expressions for the Shear Stress in Turbulent Flow in Commercial Pipe." *AIChE Journal*, 19(2), 375-376.
5. Colebrook, C.F. (1939). "Turbulent Flow in Pipes, with Particular Reference to the Transition Region between the Smooth and Rough Pipe Laws." *Journal of the Institution of Civil Engineers*, 11(4), 133-156.
6. Moody, L.F. (1947). "An Approximate Formula for Pipe Friction Factors." *Transactions of the ASME*, 69, 1005-1006.
7. Niazkar, M. (2019). "Revisiting the Estimation of Colebrook Friction Factor." *KSCE Journal of Civil Engineering*, 23(10), 4311-4326.
8. Swamee, P.K. and Jain, A.K. (1976). "Explicit Equations for Pipe-Flow Problems." *Journal of the Hydraulics Division*, 102(5), 657-664.
9. Haaland, S.E. (1983). "Simple and Explicit Formulas for the Friction Factor in Turbulent Pipe Flow." *Journal of Fluids Engineering*, 105(1), 89-90.
10. Cheng, N.-S. (2008). "Formulas for Friction Factor in Transitional Regimes." *Journal of Hydraulic Engineering*, 134(9), 1357-1362.
11. Darby, R. (2001). "Correlate Pressure Drops Through Fittings." *Chemical Engineering*, 108(4), 127-130.
12. Nayyar, M.L. (2000). *Piping Handbook*, 7th Edition. McGraw-Hill.
13. Poling, B.E., Prausnitz, J.M. and O'Connell, J.P. (2001). *The Properties of Gases and Liquids*, 5th Edition. McGraw-Hill.
14. White, F.M. (2006). *Viscous Fluid Flow*, 3rd Edition. McGraw-Hill.
