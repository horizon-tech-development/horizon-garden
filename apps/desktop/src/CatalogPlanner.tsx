import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  filterPlantCatalog,
  buildCareSchedule,
  buildHarvestSchedule,
  growingEnvironments,
  growingSeasons,
  recommendCompanions,
  starterPlantCatalog,
  validateCropPlacement,
  unresolvedCareTasks,
  validateCareResult,
  validateHarvestRecord,
  harvestUnits,
  type CareResult,
  type CareTask,
  type CropPlacement,
  type HarvestRecord,
  type HarvestUnit,
  type GrowingEnvironment,
  type GrowingSeason
} from "@horizon-garden/domain";
import { loadCareResults, loadHarvests, saveCareResult, saveHarvest, savePlacement } from "./storage";

interface Props {
  growingAreaId: string;
  initialPlacements: CropPlacement[];
}

export function CatalogPlanner({ growingAreaId, initialPlacements }: Props) {
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<GrowingSeason | "all">("all");
  const [environment, setEnvironment] = useState<GrowingEnvironment | "all">("all");
  const [selectedPlantId, setSelectedPlantId] = useState(starterPlantCatalog[0]!.id);
  const [quantity, setQuantity] = useState("1");
  const [plantedOn, setPlantedOn] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [placements, setPlacements] = useState(initialPlacements);
  const [careResults, setCareResults] = useState<CareResult[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [harvestPlacementId, setHarvestPlacementId] = useState(initialPlacements[0]?.id ?? "");
  const [harvestedOn, setHarvestedOn] = useState(new Date().toISOString().slice(0, 10));
  const [harvestAmount, setHarvestAmount] = useState("1");
  const [harvestUnit, setHarvestUnit] = useState<HarvestUnit>("count");
  const [harvestNotes, setHarvestNotes] = useState("");
  const [message, setMessage] = useState("Choose a crop from the local starter catalog.");

  const plants = useMemo(
    () => filterPlantCatalog(starterPlantCatalog, { query, season, environment }),
    [environment, query, season]
  );
  const companions = useMemo(() => recommendCompanions(selectedPlantId), [selectedPlantId]);
  const harvestSchedule = useMemo(() => buildHarvestSchedule(placements), [placements]);
  const careSchedule = useMemo(() => buildCareSchedule(placements, new Date().toISOString().slice(0, 10), 7), [placements]);
  const pendingCareSchedule = useMemo(() => unresolvedCareTasks(careSchedule, careResults), [careSchedule, careResults]);

  useEffect(() => {
    void Promise.all([loadCareResults(), loadHarvests()]).then(([results, records]) => {
      setCareResults(results);
      setHarvests(records);
    }).catch((error: unknown) => setMessage(error instanceof Error ? error.message : String(error)));
  }, []);

  async function recordCareResult(task: CareTask, status: "completed" | "skipped") {
    try {
      const saved = await saveCareResult(validateCareResult({ taskId: task.id, placementId: task.placementId, kind: task.kind, dueOn: task.dueOn, status, notes: "" }));
      setCareResults((current) => current.some((result) => result.id === saved.id) ? current : [...current, saved]);
      setMessage(status === "completed" ? "Care observation recorded." : "Care reminder skipped and retained in history.");
    } catch (error: unknown) { setMessage(error instanceof Error ? error.message : String(error)); }
  }

  async function recordHarvest(event: FormEvent) {
    event.preventDefault();
    try {
      const saved = await saveHarvest(validateHarvestRecord({ placementId: harvestPlacementId, harvestedOn, amount: Number(harvestAmount), unit: harvestUnit, notes: harvestNotes }));
      setHarvests((current) => [...current, saved]);
      setHarvestNotes("");
      setMessage("Harvest recorded locally. The crop remains active for future harvests.");
    } catch (error: unknown) { setMessage(error instanceof Error ? error.message : String(error)); }
  }

  async function placeCrop(event: FormEvent) {
    event.preventDefault();
    try {
      const input = validateCropPlacement({
        growingAreaId,
        plantId: selectedPlantId,
        quantity: Number(quantity),
        plantedOn,
        notes
      });
      const saved = await savePlacement(input);
      setPlacements((current) => [...current, saved]);
      setHarvestPlacementId((current) => current || saved.id);
      setNotes("");
      setMessage("Crop placement saved locally.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <section className="panel catalog-panel" aria-labelledby="catalog-heading">
      <div className="panel-heading">
        <div><span className="step">Planning · Step 2</span><h2 id="catalog-heading">Plant catalog</h2></div>
        <output className="status" aria-live="polite">{message}</output>
      </div>
      <div className="catalog-filters">
        <label>Search<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, scientific name, or family" /></label>
        <label>Season<select value={season} onChange={(event) => setSeason(event.target.value as GrowingSeason | "all")}><option value="all">All seasons</option>{growingSeasons.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>Growing environment<select value={environment} onChange={(event) => setEnvironment(event.target.value as GrowingEnvironment | "all")}><option value="all">All environments</option>{growingEnvironments.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>

      <div className="catalog-grid">
        {plants.map((plant) => (
          <button className={selectedPlantId === plant.id ? "plant-card selected" : "plant-card"} type="button" key={plant.id} onClick={() => setSelectedPlantId(plant.id)}>
            <strong>{plant.commonName}</strong><em>{plant.scientificName}</em>
            <span>{plant.family} · {plant.spacingMillimeters} mm spacing</span>
            <small>{plant.daysToHarvestMin}–{plant.daysToHarvestMax} days · {plant.summary}</small>
          </button>
        ))}
      </div>

      <aside className="companion-guide" aria-labelledby="companion-heading">
        <div>
          <span className="step">Nearby planting guidance</span>
          <h3 id="companion-heading">Companions for {starterPlantCatalog.find((plant) => plant.id === selectedPlantId)?.commonName}</h3>
          <p>These suggestions support diversity and garden planning; they do not guarantee insect or disease prevention.</p>
        </div>
        {companions.length > 0 ? <div className="companion-grid">{companions.map((recommendation) => (
          <article key={`${recommendation.cropId}-${recommendation.companionId}`}>
            <div><strong>{recommendation.companion.commonName}</strong><span className={`evidence ${recommendation.evidence}`}>{recommendation.evidence}</span></div>
            <small>{recommendation.benefit.replaceAll("_", " ")}</small>
            <p>{recommendation.rationale}</p>
            {recommendation.caution && <p className="caution">Caution: {recommendation.caution}</p>}
          </article>
        ))}</div> : <p>No curated companion guidance is available for this starter crop yet.</p>}
      </aside>

      <form className="placement-form" onSubmit={(event) => void placeCrop(event)}>
        <h3>Place selected crop</h3>
        <div className="form-grid">
          <label>Quantity<input type="number" min="1" max="10000" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
          <label>Planting date<input type="date" value={plantedOn} onChange={(event) => setPlantedOn(event.target.value)} required /></label>
          <label className="full-width">Notes<input value={notes} maxLength={1000} onChange={(event) => setNotes(event.target.value)} placeholder="Row, variety, seed lot, or other details" /></label>
        </div>
        <button type="submit">Add to growing area</button>
      </form>

      {placements.length > 0 && <div className="placement-list"><h3>Placed crops</h3>{placements.map((placement) => {
        const plant = starterPlantCatalog.find((entry) => entry.id === placement.plantId);
        return <div key={placement.id}><strong>{plant?.commonName ?? placement.plantId}</strong><span>{placement.quantity} planted · {placement.plantedOn}</span>{placement.notes && <small>{placement.notes}</small>}</div>;
      })}</div>}

      {placements.length > 0 && <section className="schedule harvest-log" aria-labelledby="harvest-log-heading">
        <div><span className="step">Actual results</span><h3 id="harvest-log-heading">Harvest log</h3><p>Record each picking separately. A harvest does not automatically close the crop placement.</p></div>
        <form className="placement-form" onSubmit={(event) => void recordHarvest(event)}>
          <div className="form-grid">
            <label>Crop<select value={harvestPlacementId} onChange={(event) => setHarvestPlacementId(event.target.value)} required>{placements.map((placement) => <option key={placement.id} value={placement.id}>{starterPlantCatalog.find((plant) => plant.id === placement.plantId)?.commonName ?? placement.plantId} · {placement.plantedOn}</option>)}</select></label>
            <label>Harvest date<input type="date" value={harvestedOn} onChange={(event) => setHarvestedOn(event.target.value)} required /></label>
            <label>Amount<input type="number" min="0.001" max="1000000" step={harvestUnit === "count" ? "1" : "0.001"} value={harvestAmount} onChange={(event) => setHarvestAmount(event.target.value)} required /></label>
            <label>Unit<select value={harvestUnit} onChange={(event) => setHarvestUnit(event.target.value as HarvestUnit)}>{harvestUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
            <label className="full-width">Notes<input value={harvestNotes} maxLength={1000} onChange={(event) => setHarvestNotes(event.target.value)} placeholder="Quality, variety, destination, or preservation notes" /></label>
          </div>
          <button type="submit">Record harvest</button>
        </form>
        {harvests.length > 0 && <div className="schedule-list">{[...harvests].sort((a, b) => b.harvestedOn.localeCompare(a.harvestedOn)).map((record) => {
          const placement = placements.find((item) => item.id === record.placementId);
          const plant = starterPlantCatalog.find((item) => item.id === placement?.plantId);
          return <article key={record.id}><strong>{plant?.commonName ?? "Crop"} · {record.amount} {record.unit}</strong><span>Harvested <time dateTime={record.harvestedOn}>{record.harvestedOn}</time></span>{record.notes && <span>{record.notes}</span>}</article>;
        })}</div>}
      </section>}

      {harvestSchedule.length > 0 && <section className="schedule" aria-labelledby="schedule-heading">
        <div><span className="step">Estimated timeline</span><h3 id="schedule-heading">Harvest schedule</h3><p>Actual harvest timing varies with variety, weather, and growing conditions.</p></div>
        <div className="schedule-list">{harvestSchedule.map((item) => (
          <article key={item.placementId}>
            <strong>{item.plantName}</strong>
            <span>Planted <time dateTime={item.plantedOn}>{item.plantedOn}</time></span>
            <span>Estimated harvest: <time dateTime={item.earliestHarvestOn}>{item.earliestHarvestOn}</time> – <time dateTime={item.latestHarvestOn}>{item.latestHarvestOn}</time></span>
          </article>
        ))}</div>
      </section>}

      {pendingCareSchedule.length > 0 && <section className="schedule care-schedule" aria-labelledby="care-heading">
        <div><span className="step">Next seven days</span><h3 id="care-heading">Care reminders</h3><p>These are observation prompts, not fixed watering commands. Adjust care for rainfall, soil, containers, and current plant conditions.</p></div>
        <div className="schedule-list">{pendingCareSchedule.map((task) => (
          <article key={task.id}>
            <strong>{task.title}</strong>
            <span>Due <time dateTime={task.dueOn}>{task.dueOn}</time></span>
            <span>{task.guidance}</span>
            <div className="care-actions"><button type="button" onClick={() => void recordCareResult(task, "completed")}>Record checked</button><button type="button" className="secondary" onClick={() => void recordCareResult(task, "skipped")}>Skip</button></div>
          </article>
        ))}</div>
      </section>}

      {careResults.length > 0 && <section className="schedule care-history" aria-labelledby="care-history-heading"><div><span className="step">Local record</span><h3 id="care-history-heading">Care history</h3><p>Completed and skipped observations remain visible without claiming that watering or treatment occurred.</p></div><div className="schedule-list">{[...careResults].reverse().map((result) => <article key={result.id}><strong>{result.kind === "moisture-check" ? "Moisture check" : "Plant health check"} · {result.status}</strong><span>Due {result.dueOn} · recorded <time dateTime={result.recordedAt}>{result.recordedAt.slice(0, 10)}</time></span>{result.notes && <span>{result.notes}</span>}</article>)}</div></section>}
    </section>
  );
}
