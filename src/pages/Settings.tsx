import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  HardDriveDownload,
  RotateCcw,
  Upload,
} from "lucide-react";
import { backupFileName } from "../study/backup";
import type { ImportPlan, MergeMode } from "../study/backup";
import { classifyError, errorMessage, estimateUsage } from "../study/db";
import { LIMITS } from "../study/records";
import { readMeta, writeMeta } from "../study/repository";
import { useStudy } from "../study/StudyProvider";
import { PageHeading } from "../ui";
import { downloadTextFile } from "./shared";

const STORE_LABELS: Record<keyof ImportPlan["mergeDiffs"], string> = {
  bookmarks: "Bookmarks",
  positions: "Reading positions",
  notes: "Notes",
  topics: "Topic statuses",
  history: "Reading history",
};

type Message = { kind: "ok" | "error"; text: string } | null;

export default function Settings() {
  const study = useStudy();
  const [message, setMessage] = useState<Message>(null);
  const [preview, setPreview] = useState<{
    plan: ImportPlan;
    fileName: string;
  } | null>(null);
  const [previewError, setPreviewError] = useState<{
    text: string;
    details: string[];
  } | null>(null);
  const [mode, setMode] = useState<MergeMode>("merge");
  const [replaceConfirm, setReplaceConfirm] = useState("");
  const [importing, setImporting] = useState(false);
  const [safety, setSafety] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(
    null,
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void readMeta("pre-replace-backup")
      .then((value) => setSafety(value))
      .catch(() => setSafety(null));
  }, []);

  useEffect(() => {
    let alive = true;
    void estimateUsage().then((estimate) => {
      if (alive) setUsage(estimate);
    });
    return () => {
      alive = false;
    };
  }, [study.snapshot]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (resetOpen && !element.open) element.showModal();
    if (!resetOpen && element.open) element.close();
  }, [resetOpen]);

  const counts = {
    bookmarks: study.snapshot.bookmarks.length,
    positions: study.snapshot.positions.length,
    notes: study.snapshot.notes.length,
    topics: study.snapshot.topics.length,
    history: study.snapshot.history.length,
  };
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  function exportNow() {
    if (study.status !== "ready") return;
    downloadTextFile(backupFileName(), study.exportBackupText());
    setMessage({
      kind: "ok",
      text: `Exported ${total} record${total === 1 ? "" : "s"} to a JSON file in your downloads folder.`,
    });
  }

  function downloadSafetyCopy() {
    if (!safety) return;
    downloadTextFile("jelet-prep-before-replace.json", safety);
  }

  async function chooseFile(file: File | undefined) {
    setMessage(null);
    setPreview(null);
    setPreviewError(null);
    if (!file) return;
    if (file.size > LIMITS.backupBytes) {
      setPreviewError({
        text: `That file is ${Math.round(file.size / 1024)} KB; the limit is ${LIMITS.backupBytes / 1_000_000} MB. Nothing was read.`,
        details: [],
      });
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch (error) {
      setPreviewError({
        text: errorMessage(classifyError(error)),
        details: [],
      });
      return;
    }
    const result = study.previewImport(text);
    if ("error" in result) {
      setPreviewError({ text: result.error, details: result.details });
      return;
    }
    setPreview({ plan: result.plan, fileName: file.name });
  }

  async function runImport() {
    if (!preview || study.status !== "ready") return;
    setImporting(true);
    setMessage(null);
    let safetyMessage = "";
    if (mode === "replace") {
      try {
        const previous = study.exportBackupText();
        await writeMeta("pre-replace-backup", previous);
        setSafety(previous);
        safetyMessage =
          " A safety copy of your previous data is stored on this device.";
      } catch {
        safetyMessage =
          " A safety copy could not be stored; export before replacing next time.";
      }
    }
    const result = await study.commitImport(preview.plan, mode);
    setImporting(false);
    if (result.ok) {
      setMessage({
        kind: "ok",
        text: `Import finished: ${result.written ?? 0} record${result.written === 1 ? "" : "s"} now stored.${safetyMessage}`,
      });
      setPreview(null);
      setPreviewError(null);
      setReplaceConfirm("");
      setMode("merge");
      if (fileInput.current) fileInput.current.value = "";
    } else {
      setMessage({
        kind: "error",
        text: `${result.error ?? "The import failed."} Nothing was changed.`,
      });
    }
  }

  async function resetNow() {
    setResetBusy(true);
    const outcome = await study.resetAll();
    setResetBusy(false);
    if (outcome.ok) {
      setResetOpen(false);
      setResetDone(true);
      setResetConfirm("");
      setSafety(null);
      setPreview(null);
      setMessage(null);
    } else {
      setMessage({
        kind: "error",
        text: `${outcome.error} Nothing was cleared.`,
      });
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="BACKUP & SETTINGS"
        title="Your data, on your device."
        description="There is no account and no server copy. Export a backup before clearing your browser data; importing restores what you saved."
      />

      <div className="settings-grid">
        <section className="panel" aria-labelledby="storage-state">
          <div className="panel-head">
            <h2 id="storage-state">
              <Database size={18} /> Local storage
            </h2>
            <span
              className={
                "storage-pill " +
                (study.status === "ready"
                  ? "ok"
                  : study.status === "loading"
                    ? "pending"
                    : "bad")
              }
            >
              {study.status === "ready"
                ? "Available"
                : study.status === "loading"
                  ? "Checking…"
                  : "Unavailable"}
            </span>
          </div>
          {study.status === "unavailable" ? (
            <p className="note-warning" role="alert">
              <AlertTriangle size={15} /> {study.storageError?.message} Reading
              still works; saving, importing and resetting are disabled so the
              app cannot pretend a change was stored.
            </p>
          ) : (
            <>
              <dl className="count-list">
                <div>
                  <dt>Bookmarks</dt>
                  <dd>{counts.bookmarks}</dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>{counts.notes}</dd>
                </div>
                <div>
                  <dt>Topic statuses</dt>
                  <dd>{counts.topics}</dd>
                </div>
                <div>
                  <dt>Reading positions</dt>
                  <dd>{counts.positions}</dd>
                </div>
                <div>
                  <dt>History entries</dt>
                  <dd>{counts.history}</dd>
                </div>
                <div>
                  <dt>Total records</dt>
                  <dd>{total}</dd>
                </div>
              </dl>
              <p className="panel-note">
                Stored in this browser’s IndexedDB database.{" "}
                {usage
                  ? `The browser reports about ${Math.round(usage.usage / 1024)} KB used of roughly ${Math.round(usage.quota / 1024 / 1024)} MB available for this site.`
                  : "This browser does not report storage usage."}{" "}
                Opening this site in two tabs is supported: each tab re-reads
                committed changes, and a conflicting note edit asks before
                overwriting.
              </p>
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="export-backup">
          <div className="panel-head">
            <h2 id="export-backup">
              <Download size={18} /> Export a backup
            </h2>
          </div>
          <p>
            One JSON file with your bookmarks, notes, topic statuses, reading
            positions and reading history — plus the app’s format version and
            content reference. No name, email or device identifier is included.
          </p>
          <div className="settings-actions">
            <button
              className="button primary"
              onClick={exportNow}
              disabled={study.status !== "ready"}
            >
              <Download size={16} /> Download backup
            </button>
          </div>
          {safety && (
            <p className="panel-note">
              A safety copy from before your last replace-import is on this
              device.{" "}
              <button className="link-button" onClick={downloadSafetyCopy}>
                Download that copy
              </button>
              .
            </p>
          )}
        </section>

        <section className="panel wide" aria-labelledby="import-backup">
          <div className="panel-head">
            <h2 id="import-backup">
              <Upload size={18} /> Restore from a backup
            </h2>
          </div>
          <p>
            The file is checked for format, size, record limits and reference
            validity before anything is written. A file that fails any check is
            rejected and your current data stays exactly as it is.
          </p>
          <div className="settings-actions">
            <label className="file-picker">
              <Upload size={15} />
              Choose backup file
              <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                onChange={(event) => void chooseFile(event.target.files?.[0])}
              />
            </label>
            {preview && (
              <button
                className="button secondary"
                onClick={() => {
                  setPreview(null);
                  setPreviewError(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {previewError && (
            <div className="notice warning" role="alert">
              <AlertTriangle size={18} />
              <p>
                <strong>Nothing was imported.</strong> {previewError.text}
                {previewError.details.length > 0 && (
                  <>
                    <br />
                    {previewError.details.join(" ")}
                  </>
                )}
              </p>
            </div>
          )}

          {preview && (
            <div className="import-preview">
              <h3>{preview.fileName}</h3>
              <p className="panel-note">
                Exported {preview.plan.envelope.exportedAt.slice(0, 10)} ·
                format v{preview.plan.envelope.schemaVersion} · content{" "}
                {preview.plan.envelope.contentVersion} ·{" "}
                {preview.plan.incomingCount} incoming records against{" "}
                {preview.plan.existingCount} on this device.
              </p>
              <table className="diff-table">
                <caption className="sr-only">
                  Effect of merging this backup into the current data
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Data</th>
                    <th scope="col">New</th>
                    <th scope="col">Newer</th>
                    <th scope="col">Kept as is</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    Object.keys(STORE_LABELS) as (keyof typeof STORE_LABELS)[]
                  ).map((store) => (
                    <tr key={store}>
                      <th scope="row">{STORE_LABELS[store]}</th>
                      <td>{preview.plan.mergeDiffs[store].add}</td>
                      <td>{preview.plan.mergeDiffs[store].update}</td>
                      <td>{preview.plan.mergeDiffs[store].keep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.plan.issues.map((issue) => (
                <p className="note-warning" key={issue.message}>
                  <AlertTriangle size={14} /> {issue.message}
                </p>
              ))}
              {(preview.plan.orphans.bookmarks.length > 0 ||
                preview.plan.orphans.notes.length > 0 ||
                preview.plan.orphans.topics.length > 0) && (
                <div className="note-warning">
                  <AlertTriangle size={14} />
                  <span>
                    This backup refers to content that is not in the current
                    library: {preview.plan.orphans.bookmarks.length}{" "}
                    bookmark(s), {preview.plan.orphans.notes.length} note(s),{" "}
                    {preview.plan.orphans.topics.length} topic status(es). They
                    will be kept and flagged rather than deleted.
                  </span>
                </div>
              )}
              <fieldset className="mode-choice">
                <legend>How should this import work?</legend>
                <label>
                  <input
                    type="radio"
                    name="import-mode"
                    value="merge"
                    checked={mode === "merge"}
                    onChange={() => setMode("merge")}
                  />
                  <span>
                    <strong>Merge (recommended)</strong>
                    Keep what is here. For each saved item the newer edit wins;
                    ties keep the version on this device.
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="import-mode"
                    value="replace"
                    checked={mode === "replace"}
                    onChange={() => setMode("replace")}
                  />
                  <span>
                    <strong>Replace</strong>
                    Delete all {preview.plan.existingCount} current records and
                    store only this file’s {preview.plan.incomingCount}.
                  </span>
                </label>
              </fieldset>
              {mode === "replace" && (
                <label className="confirm-field">
                  <span>
                    Type <strong>REPLACE</strong> to confirm replacing current
                    data
                  </span>
                  <input
                    value={replaceConfirm}
                    onChange={(event) => setReplaceConfirm(event.target.value)}
                    autoComplete="off"
                  />
                </label>
              )}
              <div className="settings-actions">
                <button
                  className="button primary"
                  onClick={() => void runImport()}
                  disabled={
                    importing ||
                    study.status !== "ready" ||
                    (mode === "replace" && replaceConfirm !== "REPLACE")
                  }
                >
                  {importing ? "Importing…" : "Import backup"}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="panel wide" aria-labelledby="reset-data">
          <div className="panel-head">
            <h2 id="reset-data">
              <RotateCcw size={18} /> Reset saved study data
            </h2>
          </div>
          <p>
            Clearing removes bookmarks, notes, topic statuses, reading
            positions, reading history and any stored safety copy from this
            browser. It does not delete the papers, the syllabus, your theme
            preference or your exported backup files.
          </p>
          <div className="settings-actions">
            <button
              className="button secondary"
              onClick={() => {
                setResetDone(false);
                setResetConfirm("");
                setResetOpen(true);
              }}
              disabled={study.status !== "ready" || total === 0}
            >
              <RotateCcw size={16} /> Reset study data
            </button>
          </div>
          {total === 0 && (
            <p className="panel-note">There is nothing stored to reset.</p>
          )}
        </section>

        <section className="panel wide" aria-labelledby="privacy-notes">
          <div className="panel-head">
            <h2 id="privacy-notes">
              <HardDriveDownload size={18} /> Privacy and durability
            </h2>
          </div>
          <ul className="plain-list">
            <li>
              Study data lives in this browser profile only. There is no
              account, no sync, no analytics and no server that receives it.
            </li>
            <li>
              Clearing site data, using a private window, or another browser or
              device means the data is not there. Export a JSON backup for
              anything you want to keep.
            </li>
            <li>
              If storage is full or blocked, the app reports the change as
              unsaved instead of showing a false success.
            </li>
            <li>
              Notes are stored and displayed as plain text. Markup is not
              rendered or executed.
            </li>
            <li>
              Scored practice, answer keys and offline downloads are not part of
              this version.
            </li>
          </ul>
        </section>
      </div>

      {message && (
        <div
          className={
            "notice " + (message.kind === "ok" ? "success" : "warning")
          }
          role={message.kind === "ok" ? "status" : "alert"}
        >
          {message.kind === "ok" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <p>{message.text}</p>
        </div>
      )}
      {resetDone && (
        <div className="notice success" role="status">
          <CheckCircle2 size={18} />
          <p>Saved study data was cleared from this browser.</p>
        </div>
      )}

      <dialog
        ref={dialog}
        onClose={() => setResetOpen(false)}
        className="confirm-dialog"
      >
        <h2>Reset saved study data?</h2>
        <p>This permanently clears, in this browser only:</p>
        <ul>
          <li>{counts.bookmarks} bookmark(s)</li>
          <li>{counts.notes} note(s)</li>
          <li>{counts.topics} topic status(es)</li>
          <li>{counts.positions} reading position(s)</li>
          <li>{counts.history} reading-history entr(ies)</li>
          <li>Any stored safety copy from a replace-import</li>
        </ul>
        <p>
          Your downloaded backup files, theme choice and the question papers
          themselves are not affected. This cannot be undone without a backup.
        </p>
        <label className="confirm-field">
          <span>
            Type <strong>RESET</strong> to confirm
          </span>
          <input
            value={resetConfirm}
            onChange={(event) => setResetConfirm(event.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="dialog-actions">
          <button
            className="button secondary"
            onClick={() => setResetOpen(false)}
            disabled={resetBusy}
          >
            Cancel
          </button>
          <button
            className="button danger"
            onClick={() => void resetNow()}
            disabled={resetBusy || resetConfirm !== "RESET"}
          >
            {resetBusy ? "Clearing…" : "Clear saved data"}
          </button>
        </div>
      </dialog>
    </>
  );
}
