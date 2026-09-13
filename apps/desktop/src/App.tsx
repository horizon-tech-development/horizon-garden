import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  calculateRectangle,
  fromMillimeters,
  growingAreaTypes,
  lengthUnits,
  toMillimeters,
  validateGardenSetup,
  type GardenSetupSnapshot,
  type GrowingAreaType,
  type LengthUnit
} from "@horizon-garden/domain";
import { loadSetup, saveSetup } from "./storage";

const areaLabels: Record<GrowingAreaType, string> = {
  raised_bed: "Raised bed",
  in_ground: "In-ground plot",
  container: "Container or pot",
  greenhouse_zone: "Greenhouse zone",
  indoor_box: "Indoor growing box"
};

interface FormState {
  workspaceName: string;
  propertyName: string;
  gardenName: string;
  growingAreaName: string;
  growingAreaType: GrowingAreaType;
  displayUnit: LengthUnit;
  length: string;
  width: string;
  depth: string;
}

const emptyForm: FormState = {
  workspaceName: "",
  propertyName: "",
  gardenName: "",
  growingAreaName: "",
  growingAreaType: "raised_bed",
  displayUnit: "ft",
  length: "8",
  width: "4",
  depth: "1"
};

function formFromSnapshot(snapshot: GardenSetupSnapshot): FormState {
  return {
    workspaceName: snapshot.workspaceName,
    propertyName: snapshot.propertyName,
    gardenName: snapshot.gardenName,
    growingAreaName: snapshot.growingAreaName,
    growingAreaType: snapshot.growingAreaType,
    displayUnit: snapshot.displayUnit,
    length: String(fromMillimeters(snapshot.lengthMillimeters, snapshot.displayUnit)),
    width: String(fromMillimeters(snapshot.widthMillimeters, snapshot.displayUnit)),
    depth: String(fromMillimeters(snapshot.depthMillimeters, snapshot.displayUnit))
  };
}

export function App() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [snapshot, setSnapshot] = useState<GardenSetupSnapshot | null>(null);
  const [message, setMessage] = useState("Loading your local garden…");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    void loadSetup()
      .then((stored) => {
        if (stored) {
          setSnapshot(stored);
          setForm(formFromSnapshot(stored));
          setMessage("Your garden is stored locally on this device.");
        } else {
          setMessage("Create your first garden workspace.");
        }
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setBusy(false));
  }, []);

  const calculations = useMemo(() => {
    try {
      return calculateRectangle({
        lengthMillimeters: toMillimeters({ value: Number(form.length), unit: form.displayUnit }),
        widthMillimeters: toMillimeters({ value: Number(form.width), unit: form.displayUnit }),
        depthMillimeters: toMillimeters({ value: Number(form.depth), unit: form.displayUnit })
      });
    } catch {
      return null;
    }
  }, [form.depth, form.displayUnit, form.length, form.width]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const input = validateGardenSetup({
        workspaceName: form.workspaceName,
        propertyName: form.propertyName,
        gardenName: form.gardenName,
        growingAreaName: form.growingAreaName,
        growingAreaType: form.growingAreaType,
        displayUnit: form.displayUnit,
        lengthMillimeters: toMillimeters({ value: Number(form.length), unit: form.displayUnit }),
        widthMillimeters: toMillimeters({ value: Number(form.width), unit: form.displayUnit }),
        depthMillimeters: toMillimeters({ value: Number(form.depth), unit: form.displayUnit })
      });
      const saved = await saveSetup(input);
      setSnapshot(saved);
      setForm(formFromSnapshot(saved));
      setMessage("Saved locally. You can close and reopen Horizon Garden safely.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <span className="eyebrow">Offline-first garden planning</span>
        <h1>Horizon Garden</h1>
        <p>Build the foundation of your growing space. Your data stays on this device.</p>
      </header>

      <section className="panel" aria-labelledby="setup-heading">
        <div className="panel-heading">
          <div>
            <span className="step">Foundation · Step 1</span>
            <h2 id="setup-heading">{snapshot ? "Edit your garden" : "Create your garden"}</h2>
          </div>
          <output className="status" aria-live="polite">{message}</output>
        </div>

        <form onSubmit={(event) => void submit(event)}>
          <div className="form-grid">
            <label>Workspace name<input value={form.workspaceName} onChange={(event) => update("workspaceName", event.target.value)} placeholder="Scott Family Garden" required /></label>
            <label>Property name<input value={form.propertyName} onChange={(event) => update("propertyName", event.target.value)} placeholder="Home" required /></label>
            <label>Garden name<input value={form.gardenName} onChange={(event) => update("gardenName", event.target.value)} placeholder="Backyard Garden" required /></label>
            <label>Growing area name<input value={form.growingAreaName} onChange={(event) => update("growingAreaName", event.target.value)} placeholder="North Raised Bed" required /></label>
            <label>Growing area type<select value={form.growingAreaType} onChange={(event) => update("growingAreaType", event.target.value as GrowingAreaType)}>{growingAreaTypes.map((type) => <option key={type} value={type}>{areaLabels[type]}</option>)}</select></label>
            <label>Measurement unit<select value={form.displayUnit} onChange={(event) => update("displayUnit", event.target.value as LengthUnit)}>{lengthUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
          </div>

          <fieldset>
            <legend>Rectangular dimensions</legend>
            <div className="dimensions">
              {(["length", "width", "depth"] as const).map((field) => (
                <label key={field}>{field[0]!.toUpperCase() + field.slice(1)}<span className="input-with-unit"><input type="number" min="0.001" step="any" value={form[field]} onChange={(event) => update(field, event.target.value)} required /><span>{form.displayUnit}</span></span></label>
              ))}
            </div>
          </fieldset>

          {calculations && (
            <div className="calculations" aria-label="Calculated growing area">
              <div><span>Surface area</span><strong>{calculations.areaSquareMeters.toFixed(2)} m²</strong></div>
              <div><span>Soil volume</span><strong>{calculations.soilVolumeLiters.toFixed(0)} L</strong></div>
            </div>
          )}

          <button type="submit" disabled={busy}>{busy ? "Saving…" : snapshot ? "Save changes" : "Create garden"}</button>
        </form>
      </section>

      {snapshot && (
        <section className="saved-card" aria-labelledby="saved-heading">
          <span>{areaLabels[snapshot.growingAreaType]}</span>
          <h2 id="saved-heading">{snapshot.growingAreaName}</h2>
          <p>{snapshot.workspaceName} · {snapshot.propertyName} · {snapshot.gardenName}</p>
          <small>Durable ID: {snapshot.growingAreaId}</small>
        </section>
      )}
    </main>
  );
}
