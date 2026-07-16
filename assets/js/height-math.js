/* ============================================
   TWPHeightMath — shared ergonomic height formulas
   Frozen to match ergonomic-height-calculator.html (rev 2026-07)
   Coefficients are fractions of standing height in inches.
   ============================================ */
(function (global) {
  'use strict';

  function roundVal(v) {
    return Math.round(v * 10) / 10;
  }

  /**
   * @param {number} heightInches - body height in inches
   * @returns {{standingDesk:number,sittingDesk:number,chair:number,monitorTop:number,monitorDistance:number,keyboard:number}}
   */
  function computeFromInches(heightInches) {
    var h = Number(heightInches);
    if (!isFinite(h) || h <= 0) {
      throw new Error('heightInches must be a positive number');
    }
    var sitting = h * 0.27;
    return {
      standingDesk: roundVal(h * 0.55),
      sittingDesk: roundVal(sitting),
      chair: roundVal(h * 0.25),
      monitorTop: roundVal(h * 0.93),
      monitorDistance: roundVal(Math.min(28, Math.max(18, h * 0.33))),
      keyboard: roundVal(sitting)
    };
  }

  function inchesToCm(inches) {
    return roundVal(inches * 2.54);
  }

  /** Golden test: 69 in → standing desk 37.95 → display 38.0? roundVal(69*0.55)=roundVal(37.95)=38.0 */
  function selfTest() {
    var r = computeFromInches(69);
    var expectedStanding = roundVal(69 * 0.55);
    var metricStanding = inchesToCm(69 * 0.55);
    // metricStanding uses unrounded intermediate * 2.54 then roundVal: 37.95*2.54=96.393 → 96.4
    if (r.standingDesk !== expectedStanding) return false;
    if (metricStanding !== 96.4) return false;
    return true;
  }

  global.TWPHeightMath = {
    computeFromInches: computeFromInches,
    roundVal: roundVal,
    inchesToCm: inchesToCm,
    selfTest: selfTest,
    COEFFS: {
      standingDesk: 0.55,
      sittingDesk: 0.27,
      chair: 0.25,
      monitorTop: 0.93,
      monitorDistanceMin: 18,
      monitorDistanceMax: 28,
      monitorDistanceFrac: 0.33
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
