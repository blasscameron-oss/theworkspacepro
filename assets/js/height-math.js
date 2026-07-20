/* ============================================
   TWPHeightMath — shared ergonomic height estimator
   Coefficients are The Workspace Pro heuristics, expressed as fractions of
   standing height in inches. They are starting points, not medical guidance.
   ============================================ */
(function (global) {
  'use strict';

  var COEFFS = {
    standingDesk: 0.55,
    sittingDesk: 0.405,
    chair: 0.25,
    monitorTop: 0.70,
    keyboard: 0.405,
    monitorDistanceMin: 18,
    monitorDistanceMax: 28,
    monitorDistanceFrac: 0.33
  };

  var RANGE_OFFSETS = {
    standingDesk: 1,
    sittingDesk: 1,
    chair: 0.5,
    monitorTop: 1,
    monitorDistance: 2,
    keyboard: 1
  };

  function roundVal(v) {
    return Math.round(v * 10) / 10;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function validateHeight(heightInches) {
    var h = Number(heightInches);
    if (!isFinite(h) || h <= 0) {
      throw new Error('heightInches must be a positive number');
    }
    return h;
  }

  /** Return point estimates in inches from one shared coefficient contract. */
  function computeFromInches(heightInches) {
    var h = validateHeight(heightInches);
    return {
      standingDesk: roundVal(h * COEFFS.standingDesk),
      sittingDesk: roundVal(h * COEFFS.sittingDesk),
      chair: roundVal(h * COEFFS.chair),
      monitorTop: roundVal(h * COEFFS.monitorTop),
      monitorDistance: roundVal(clamp(
        h * COEFFS.monitorDistanceFrac,
        COEFFS.monitorDistanceMin,
        COEFFS.monitorDistanceMax
      )),
      keyboard: roundVal(h * COEFFS.keyboard)
    };
  }

  function makeRange(estimate, offset, min, max) {
    return {
      min: roundVal(clamp(estimate - offset, min, max)),
      estimate: estimate,
      max: roundVal(clamp(estimate + offset, min, max))
    };
  }

  /** Return each estimated starting point plus a practical adjustment range. */
  function computeRangesFromInches(heightInches) {
    var estimates = computeFromInches(heightInches);
    return {
      standingDesk: makeRange(estimates.standingDesk, RANGE_OFFSETS.standingDesk, 0, Infinity),
      sittingDesk: makeRange(estimates.sittingDesk, RANGE_OFFSETS.sittingDesk, 0, Infinity),
      chair: makeRange(estimates.chair, RANGE_OFFSETS.chair, 0, Infinity),
      monitorTop: makeRange(estimates.monitorTop, RANGE_OFFSETS.monitorTop, 0, Infinity),
      monitorDistance: makeRange(
        estimates.monitorDistance,
        RANGE_OFFSETS.monitorDistance,
        COEFFS.monitorDistanceMin,
        COEFFS.monitorDistanceMax
      ),
      keyboard: makeRange(estimates.keyboard, RANGE_OFFSETS.keyboard, 0, Infinity)
    };
  }

  function inchesToCm(inches) {
    return roundVal(inches * 2.54);
  }

  function sameResults(actual, expected) {
    var keys = ['standingDesk', 'sittingDesk', 'chair', 'monitorTop', 'monitorDistance', 'keyboard'];
    for (var i = 0; i < keys.length; i += 1) {
      if (actual[keys[i]] !== expected[keys[i]]) return false;
    }
    return true;
  }

  /** Golden cases, range invariants, and inch/metric input parity. */
  function selfTest() {
    var golden = [
      [48, { standingDesk: 26.4, sittingDesk: 19.4, chair: 12, monitorTop: 33.6, monitorDistance: 18, keyboard: 19.4 }],
      [69, { standingDesk: 38, sittingDesk: 27.9, chair: 17.3, monitorTop: 48.3, monitorDistance: 22.8, keyboard: 27.9 }],
      [84, { standingDesk: 46.2, sittingDesk: 34, chair: 21, monitorTop: 58.8, monitorDistance: 27.7, keyboard: 34 }]
    ];

    for (var i = 0; i < golden.length; i += 1) {
      var height = golden[i][0];
      var result = computeFromInches(height);
      if (!sameResults(result, golden[i][1])) return false;

      var metricHeight = height * 2.54;
      if (!sameResults(result, computeFromInches(metricHeight / 2.54))) return false;

      var ranges = computeRangesFromInches(height);
      var keys = Object.keys(ranges);
      for (var j = 0; j < keys.length; j += 1) {
        var range = ranges[keys[j]];
        if (!(range.min <= range.estimate && range.estimate <= range.max)) return false;
      }
      if (ranges.monitorDistance.min < 18 || ranges.monitorDistance.max > 28) return false;
    }

    return inchesToCm(69) === 175.3 && inchesToCm(38) === 96.5;
  }

  global.TWPHeightMath = {
    computeFromInches: computeFromInches,
    computeRangesFromInches: computeRangesFromInches,
    roundVal: roundVal,
    inchesToCm: inchesToCm,
    selfTest: selfTest,
    COEFFS: COEFFS,
    RANGE_OFFSETS: RANGE_OFFSETS
  };
})(typeof window !== 'undefined' ? window : globalThis);
