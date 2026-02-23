import { describe, it, expect } from 'vitest';
import {
  median,
  percentile,
  pearsonCorrelation,
  movingAverage,
  mean,
  standardDeviation,
} from '../src/utils/statistics';

describe('median', () => {
  it('should return median of odd-length array', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([5, 1, 3, 2, 4])).toBe(3);
  });

  it('should return average of two middle values for even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([1, 2, 2, 3, 3, 4, 5, 7, 10, 14])).toBe(3.5);
  });

  it('should return 0 for empty array', () => {
    expect(median([])).toBe(0);
  });

  it('should handle single element', () => {
    expect(median([42])).toBe(42);
  });

  it('should not mutate the original array', () => {
    const arr = [3, 1, 2];
    median(arr);
    expect(arr).toEqual([3, 1, 2]);
  });
});

describe('percentile', () => {
  it('should return correct p50 (same as median)', () => {
    const values = [1, 2, 3, 4, 5];
    expect(percentile(values, 50)).toBe(3);
  });

  it('should return correct p90', () => {
    // sorted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // index = 0.9 * 9 = 8.1
    // lower = 8 (value 9), upper = 9 (value 10)
    // result = 9 + 0.1 * (10 - 9) = 9.1
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(values, 90)).toBeCloseTo(9.1, 5);
  });

  it('should return 0 for empty array', () => {
    expect(percentile([], 50)).toBe(0);
  });

  it('should return min for p0 and max for p100', () => {
    const values = [10, 20, 30, 40, 50];
    expect(percentile(values, 0)).toBe(10);
    expect(percentile(values, 100)).toBe(50);
  });

  it('should interpolate correctly for p25', () => {
    // sorted: [2, 4, 6, 8, 10]
    // index = 0.25 * 4 = 1.0
    // lower = 1, upper = 1 => value at index 1 = 4
    const values = [2, 4, 6, 8, 10];
    expect(percentile(values, 25)).toBe(4);
  });
});

describe('pearsonCorrelation', () => {
  it('should return 1 for perfectly positive linear relationship', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(1, 10);
  });

  it('should return -1 for perfectly negative linear relationship', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(-1, 10);
  });

  it('should return 0 for uncorrelated data', () => {
    // Perfectly orthogonal data
    const x = [1, 0, -1, 0];
    const y = [0, 1, 0, -1];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(0, 10);
  });

  it('should return 0 for arrays shorter than 2 or different lengths', () => {
    expect(pearsonCorrelation([1], [2])).toBe(0);
    expect(pearsonCorrelation([1, 2, 3], [1, 2])).toBe(0);
  });

  it('should return 0 when standard deviation is 0 (all same values)', () => {
    const x = [5, 5, 5, 5];
    const y = [1, 2, 3, 4];
    expect(pearsonCorrelation(x, y)).toBe(0);
  });
});

describe('movingAverage', () => {
  it('should compute moving average with window 3', () => {
    const values = [1, 2, 3, 4, 5];
    const result = movingAverage(values, 3);

    // [1+2+3]/3=2, [2+3+4]/3=3, [3+4+5]/3=4
    expect(result).toEqual([2, 3, 4]);
  });

  it('should return empty for empty input', () => {
    expect(movingAverage([], 3)).toEqual([]);
  });

  it('should return empty for window <= 0', () => {
    expect(movingAverage([1, 2, 3], 0)).toEqual([]);
    expect(movingAverage([1, 2, 3], -1)).toEqual([]);
  });

  it('should return single element when window equals array length', () => {
    const values = [2, 4, 6];
    const result = movingAverage(values, 3);
    expect(result).toEqual([4]);
  });

  it('should return all elements with window 1', () => {
    const values = [10, 20, 30];
    const result = movingAverage(values, 1);
    expect(result).toEqual([10, 20, 30]);
  });
});

describe('mean', () => {
  it('should compute arithmetic mean', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([10, 20])).toBe(15);
  });

  it('should return 0 for empty array', () => {
    expect(mean([])).toBe(0);
  });
});

describe('standardDeviation', () => {
  it('should compute sample standard deviation', () => {
    // Population: [2, 4, 4, 4, 5, 5, 7, 9]
    // Mean = 5, variance (sample) = sum((xi-5)^2) / (8-1) = 32/7
    // SD = sqrt(32/7) ~= 2.138
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(standardDeviation(values)).toBeCloseTo(2.138, 2);
  });

  it('should return 0 for fewer than 2 values', () => {
    expect(standardDeviation([])).toBe(0);
    expect(standardDeviation([5])).toBe(0);
  });
});
