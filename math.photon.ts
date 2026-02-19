/**
 * Calculator - Math expression evaluator
 *
 * Evaluate math expressions with functions like sqrt, sin, cos, mean, median, etc.
 *
 * @version 1.1.0
 * @author Portel
 * @license MIT
 * @icon 🧮
 * @tags math, calculator, expressions
 */

export default class Calculator {
  /**
   * Calculate a math expression
   * @param expression {@example sqrt(16) + pow(2, 3) - abs(-2)}
   * @format primitive
   */
  async calculate(params: { expression: string }) {
    const allowed = {
      sqrt: Math.sqrt,
      log: Math.log,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      pow: Math.pow,
      min: Math.min,
      max: Math.max,
      abs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      random: Math.random,
      sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
      mean: (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length,
      median: (arr: number[]) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      },
      std: (arr: number[]) => {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        return Math.sqrt(
          arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
        );
      },
      PI: Math.PI,
      E: Math.E,
    };

    try {
      const expr = params.expression.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      const fn = new Function(...Object.keys(allowed), `return (${expr})`);
      const result = fn(...Object.values(allowed));

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid calculation result');
      }

      return result;
    } catch (e) {
      throw new Error(`Failed to calculate: ${(e as Error).message}`);
    }
  }
}
