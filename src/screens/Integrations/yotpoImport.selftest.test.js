/* ============================================================================
 * yotpoImport.selftest.test.js — evidence gate for yotpoImport.ts.
 *
 * Deliberately .js, following screens/SmartSend/*.selftest.test.ts's reasoning
 * in reverse: this repo has no @types/jest and tsconfig includes src, so a .ts
 * test with a bare describe() fails `react-scripts build`. A .js test is not
 * type-checked (checkJs is off), so the globals are simply available.
 *
 * Every case below is a bug that shipped. The names say which.
 * ========================================================================= */

import {
  aggregateImportStatus,
  pendingImportJobIds,
  isCsvFile,
  partitionCsvFiles,
  IMPORT_TERMINAL_STATUSES,
} from './yotpoImport';

const job = (Status, Processed, Failed, TotalRows, Error) => ({
  Status, Processed, Failed, TotalRows, Error,
});

describe('aggregateImportStatus — multi-file import status', () => {
  test('sums counts across every job, not just the first', () => {
    const result = aggregateImportStatus([1, 2, 3], {
      1: job('done', 10, 0, 10),
      2: job('done', 20, 5, 25),
      3: job('done', 30, 0, 30),
    });
    expect(result.processed).toBe(60);
    expect(result.failed).toBe(5);
    expect(result.total).toBe(65);
  });

  test('row-level failures are not job-level failures', () => {
    // Two different things share the word "failed": a job whose Status is
    // 'failed' (the whole file died) and a job that finished with some rows
    // rejected. This is the second kind, so the import IS complete — the count
    // surfaces through importDone's "{{processed}} imported, {{failed}} failed".
    const result = aggregateImportStatus([1], { 1: job('done', 60, 5, 65) });
    expect(result.status).toBe('done');
    expect(result.failed).toBe(5);
    expect(result.isTerminal).toBe(true);
  });

  test('one job-level failure turns the whole import red', () => {
    const result = aggregateImportStatus([1, 2], {
      1: job('done', 60, 0, 60),
      2: job('failed', 0, 0, 0),
    });
    expect(result.status).toBe('failed');
  });

  test('THE BUG: a clean job 0 no longer makes a broken job 2 look successful', () => {
    // Before the fix only data.Data[0] was polled, so this rendered as "done".
    const result = aggregateImportStatus([1, 2], {
      1: job('done', 100, 0, 100),
      2: job('failed', 0, 50, 50, 'Malformed header'),
    });
    expect(result.status).toBe('failed');
    expect(result.isTerminal).toBe(true);
    expect(result.error).toBe('Malformed header');
  });

  test('stays "processing" while any file is still running', () => {
    const result = aggregateImportStatus([1, 2], {
      1: job('done', 10, 0, 10),
      2: job('processing', 3, 0, 10),
    });
    expect(result.status).toBe('processing');
    expect(result.isTerminal).toBe(false);
    expect(result.filesDone).toBe(1);
    expect(result.filesTotal).toBe(2);
  });

  test('a job that has not reported yet cannot let the panel settle on done', () => {
    // Job 2's request keeps failing: known.length < jobIds.length.
    const result = aggregateImportStatus([1, 2], { 1: job('done', 10, 0, 10) });
    expect(result.isTerminal).toBe(false);
    expect(result.status).not.toBe('done');
    expect(result.filesTotal).toBe(2);
  });

  test('reports done only when every file is terminal', () => {
    const result = aggregateImportStatus([1, 2], {
      1: job('done', 10, 0, 10),
      2: job('done', 10, 0, 10),
    });
    expect(result.status).toBe('done');
    expect(result.isTerminal).toBe(true);
    expect(result.filesDone).toBe(2);
  });

  test('no jobs at all is not a completed import', () => {
    const result = aggregateImportStatus([], {});
    expect(result.isTerminal).toBe(false);
    expect(result.status).toBe('queued');
    expect(result.processed).toBe(0);
  });

  test('status matching is case-insensitive', () => {
    const result = aggregateImportStatus([1], { 1: job('DONE', 5, 0, 5) });
    expect(result.status).toBe('done');
    expect(result.isTerminal).toBe(true);
  });

  test('missing, null and string counts do not produce NaN', () => {
    // The API has been seen returning nulls before a job starts, and the whole
    // panel reads NaN/NaN the moment one leaks into the sum.
    const result = aggregateImportStatus([1, 2], {
      1: { Status: 'processing' },
      2: { Status: 'processing', Processed: '7', Failed: null, TotalRows: undefined },
    });
    expect(result.processed).toBe(7);
    expect(result.failed).toBe(0);
    expect(result.total).toBe(0);
    expect(Number.isNaN(result.processed)).toBe(false);
  });

  test('filesDone never exceeds filesTotal', () => {
    const result = aggregateImportStatus([1, 2, 3], {
      1: job('done', 1, 0, 1),
      2: job('failed', 0, 1, 1),
      3: job('queued', 0, 0, 0),
    });
    expect(result.filesDone).toBe(2);
    expect(result.filesTotal).toBe(3);
    expect(result.filesDone).toBeLessThanOrEqual(result.filesTotal);
  });
});

describe('pendingImportJobIds — which jobs still need polling', () => {
  test('finished jobs stop being requested', () => {
    expect(pendingImportJobIds([1, 2, 3], {
      1: job('done', 1, 0, 1),
      2: job('processing', 1, 0, 5),
      3: job('failed', 0, 1, 1),
    })).toEqual([2]);
  });

  test('a job with no snapshot is still pending', () => {
    expect(pendingImportJobIds([1, 2], { 1: job('done', 1, 0, 1) })).toEqual([2]);
  });

  test('all terminal means nothing left to poll, which is what stops the interval', () => {
    expect(pendingImportJobIds([1, 2], {
      1: job('done', 1, 0, 1),
      2: job('failed', 0, 1, 1),
    })).toEqual([]);
  });
});

describe('CSV validation — accept=".csv" is only a picker hint', () => {
  test('accepts .csv in any case', () => {
    expect(isCsvFile({ name: 'a.csv' })).toBe(true);
    expect(isCsvFile({ name: 'A.CSV' })).toBe(true);
    expect(isCsvFile({ name: 'part.1.Csv' })).toBe(true);
  });

  test('THE BUG: rejects what drag-and-drop used to let through', () => {
    // onDrop called setCsvFiles(e.dataTransfer.files) with no checks at all, and
    // accept="" never applies to drops.
    expect(isCsvFile({ name: 'notes.txt' })).toBe(false);
    expect(isCsvFile({ name: 'report.pdf' })).toBe(false);
    expect(isCsvFile({ name: 'sheet.xlsx' })).toBe(false);
  });

  test('does not accept a name that merely contains .csv', () => {
    expect(isCsvFile({ name: 'data.csv.exe' })).toBe(false);
    expect(isCsvFile({ name: 'csv' })).toBe(false);
    expect(isCsvFile({ name: 'my.csv.zip' })).toBe(false);
  });

  test('survives a missing or empty name', () => {
    expect(isCsvFile({})).toBe(false);
    expect(isCsvFile({ name: '' })).toBe(false);
    expect(isCsvFile(null)).toBe(false);
    expect(isCsvFile(undefined)).toBe(false);
  });

  test('partitions a mixed drop so the error can name the offenders', () => {
    const { accepted, rejected } = partitionCsvFiles([
      { name: 'part1.csv' }, { name: 'notes.txt' },
      { name: 'part2.CSV' }, { name: 'report.pdf' },
    ]);
    expect(accepted.map((f) => f.name)).toEqual(['part1.csv', 'part2.CSV']);
    expect(rejected.map((f) => f.name)).toEqual(['notes.txt', 'report.pdf']);
  });

  test('an empty or absent list is not an error', () => {
    expect(partitionCsvFiles([])).toEqual({ accepted: [], rejected: [] });
    expect(partitionCsvFiles(null)).toEqual({ accepted: [], rejected: [] });
  });
});

describe('IMPORT_TERMINAL_STATUSES', () => {
  test('matches the states the poller treats as final', () => {
    expect(IMPORT_TERMINAL_STATUSES).toEqual(['done', 'failed']);
  });
});
