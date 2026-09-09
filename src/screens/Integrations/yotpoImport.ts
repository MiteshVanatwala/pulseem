/* ============================================================================
 * Pure logic behind the Yotpo CSV import panel, extracted from Yotpo.tsx so it
 * can be tested without mounting the screen (which needs redux, i18n and MUI).
 *
 * Nothing here touches React, the network or the DOM — callers hand in plain
 * data and get plain data back. The screen keeps ownership of state, requests
 * and rendering.
 *
 * Covered by yotpoImport.selftest.test.js. That file is deliberately .js: this
 * repo has no @types/jest and tsconfig includes src, so a .ts test with a bare
 * describe() would fail `react-scripts build`. Same reasoning as
 * screens/SmartSend/*.selftest.test.ts documents at length.
 * ========================================================================= */

/** A job in one of these states will not change again, so it stops being polled. */
export const IMPORT_TERMINAL_STATUSES = ['done', 'failed'];

export interface ImportJobSnapshot {
  Status?: string;
  Processed?: number | string | null;
  Failed?: number | string | null;
  TotalRows?: number | string | null;
  Error?: string | null;
}

export interface AggregatedImportStatus {
  status: string;
  processed: number;
  failed: number;
  total: number;
  error?: string | null;
  filesTotal: number;
  filesDone: number;
  isTerminal: boolean;
}

const isTerminalStatus = (status: string) => IMPORT_TERMINAL_STATUSES.indexOf(status) !== -1;

/**
 * One CSV upload queues one job per file, so the panel has to speak for all of
 * them: summed counts, and a status that only reads "done" once every file is
 * in. Reporting job[0] alone made a partly-failed multi-file import
 * indistinguishable from a clean one.
 *
 * `snapshots` holds the last status seen per job id. A missing entry means that
 * job has not reported yet — which is not the same as having no rows, and must
 * never let the panel settle on a terminal state.
 */
export const aggregateImportStatus = (
  jobIds: number[],
  snapshots: Record<number, ImportJobSnapshot | null | undefined>,
): AggregatedImportStatus => {
  const known = jobIds
    .map((id) => snapshots[id])
    .filter(Boolean) as ImportJobSnapshot[];

  const sum = (pick: (job: ImportJobSnapshot) => any) => known.reduce(
    (running, job) => running + (Number(pick(job)) || 0),
    0,
  );

  const statuses = known.map((job) => String(job.Status || '').toLowerCase());
  // Every job must have reported before the panel is allowed to finish. A file
  // whose request keeps failing leaves the import open, not "done".
  const allReported = known.length === jobIds.length;
  const allTerminal = allReported
    && statuses.length > 0
    && statuses.every(isTerminalStatus);

  let status: string;
  if (allTerminal) status = statuses.indexOf('failed') !== -1 ? 'failed' : 'done';
  else if (statuses.indexOf('processing') !== -1) status = 'processing';
  else status = 'queued';

  const errored = known.filter((job) => job.Error)[0];

  return {
    status,
    processed: sum((job) => job.Processed),
    failed: sum((job) => job.Failed),
    total: sum((job) => job.TotalRows),
    error: errored ? errored.Error : undefined,
    filesTotal: jobIds.length,
    filesDone: statuses.filter(isTerminalStatus).length,
    isTerminal: allTerminal,
  };
};

/** Which job ids still need requesting on the next poll cycle. */
export const pendingImportJobIds = (
  jobIds: number[],
  snapshots: Record<number, ImportJobSnapshot | null | undefined>,
): number[] => jobIds.filter((id) => {
  const snapshot = snapshots[id];
  return !snapshot || !isTerminalStatus(String(snapshot.Status || '').toLowerCase());
});

/**
 * accept=".csv" only filters the file dialog — it is bypassed by choosing "All
 * files", and drag-and-drop ignores it outright. So the extension is checked
 * here, against anything with a name, for both entry points.
 */
export const isCsvFile = (file: { name?: string } | null | undefined): boolean =>
  !!file && /\.csv$/i.test(String(file.name || ''));

export const partitionCsvFiles = <T extends { name?: string }>(files: T[]) => {
  const accepted: T[] = [];
  const rejected: T[] = [];
  (files || []).forEach((file) => (isCsvFile(file) ? accepted : rejected).push(file));
  return { accepted, rejected };
};
