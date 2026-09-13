import { useMemo, useState, type FormEvent } from "react";
import {
  filterPlantCatalog,
  growingEnvironments,
  growingSeasons,
  starterPlantCatalog,
  validateCropPlacement,
  type CropPlacement,
  type GrowingEnvironment,
  type GrowingSeason
} from "@horizon-garden/domain";
import { savePlacement } from "./storage";

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
  const [message, setMessage] = useState("Choose a crop from the local starter catalog.");

  const plants = useMemo(
    () => filterPlantCatalog(starterPlantCatalog, { query, season, environment }),
    [environment, query, season]
  );

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
    </section>
  );
}
