use chrono::{SecondsFormat, Utc};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{Manager, State};
use thiserror::Error;
use uuid::Uuid;

struct Database(Mutex<Connection>);

#[derive(Debug, Error)]
enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("File error: {0}")]
    File(#[from] std::io::Error),
    #[error("Application data directory is unavailable.")]
    MissingDataDirectory,
    #[error("Invalid garden setup: {0}")]
    Validation(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GardenSetupInput {
    workspace_name: String,
    property_name: String,
    garden_name: String,
    growing_area_name: String,
    growing_area_type: String,
    display_unit: String,
    length_millimeters: i64,
    width_millimeters: i64,
    depth_millimeters: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct GardenSetupSnapshot {
    workspace_id: String,
    property_id: String,
    garden_id: String,
    growing_area_id: String,
    workspace_name: String,
    property_name: String,
    garden_name: String,
    growing_area_name: String,
    growing_area_type: String,
    display_unit: String,
    length_millimeters: i64,
    width_millimeters: i64,
    depth_millimeters: i64,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CropPlacementInput {
    growing_area_id: String,
    plant_id: String,
    quantity: i64,
    planted_on: String,
    notes: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CropPlacement {
    id: String,
    growing_area_id: String,
    plant_id: String,
    quantity: i64,
    planted_on: String,
    notes: String,
    created_at: String,
}

const STARTER_PLANT_IDS: [&str;  8] = [
    "plant-tomato", "plant-pepper", "plant-lettuce", "plant-carrot",
    "plant-basil", "plant-garlic", "plant-marigold", "plant-chives",
];

fn validate_placement(input: &CropPlacementInput) -> Result<(), AppError> {
    if input.growing_area_id.trim().is_empty() {
        return Err(AppError::Validation("A growing area is required.".into()));
    }
    if !STARTER_PLANT_IDS.contains(&input.plant_id.as_str()) {
        return Err(AppError::Validation("Select a known plant.".into()));
    }
    if !(1..=10_000).contains(&input.quantity) {
        return Err(AppError::Validation("Quantity must be between 1 and 10,000.".into()));
    }
    if chrono::NaiveDate::parse_from_str(&input.planted_on, "%Y-%m-%d").is_err() {
        return Err(AppError::Validation("Planting date is invalid.".into()));
    }
    if input.notes.chars().count() > 1_000 {
        return Err(AppError::Validation("Notes cannot exceed 1,000 characters.".into()));
    }
    Ok(())
}

fn validate_input(input: &GardenSetupInput) -> Result<(), AppError> {
    let names = [
        ("Workspace name", input.workspace_name.trim()),
        ("Property name", input.property_name.trim()),
        ("Garden name", input.garden_name.trim()),
        ("Growing area name", input.growing_area_name.trim()),
    ];
    for (label, value) in names {
        if value.is_empty() {
            return Err(AppError::Validation(format!("{label} is required.")));
        }
        if value.chars().count() > 120 {
            return Err(AppError::Validation(format!(
                "{label} cannot exceed 120 characters."
            )));
        }
    }

    if !["raised_bed", "in_ground", "container", "greenhouse_zone", "indoor_box"]
        .contains(&input.growing_area_type.as_str())
    {
        return Err(AppError::Validation("Unknown growing area type.".into()));
    }
    if !["in", "ft", "cm", "m"].contains(&input.display_unit.as_str()) {
        return Err(AppError::Validation("Unknown measurement unit.".into()));
    }
    for value in [
        input.length_millimeters,
        input.width_millimeters,
        input.depth_millimeters,
    ] {
        if !(1..=1_000_000).contains(&value) {
            return Err(AppError::Validation(
                "Dimensions must be between 1 millimeter and 1,000 meters.".into(),
            ));
        }
    }
    Ok(())
}

fn migrate(connection: &Connection) -> Result<(), AppError> {
    connection.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;
         CREATE TABLE IF NOT EXISTS schema_migrations (
           version INTEGER PRIMARY KEY,
           applied_at TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS workspaces (
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           created_at TEXT NOT NULL,
           updated_at TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS properties (
           id TEXT PRIMARY KEY,
           workspace_id TEXT NOT NULL REFERENCES workspaces(id),
           name TEXT NOT NULL,
           created_at TEXT NOT NULL,
           updated_at TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS gardens (
           id TEXT PRIMARY KEY,
           property_id TEXT NOT NULL REFERENCES properties(id),
           name TEXT NOT NULL,
           created_at TEXT NOT NULL,
           updated_at TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS growing_areas (
           id TEXT PRIMARY KEY,
           garden_id TEXT NOT NULL REFERENCES gardens(id),
           name TEXT NOT NULL,
           area_type TEXT NOT NULL CHECK(area_type IN ('raised_bed','in_ground','container','greenhouse_zone','indoor_box')),
           shape TEXT NOT NULL CHECK(shape = 'rectangle'),
           display_unit TEXT NOT NULL CHECK(display_unit IN ('in','ft','cm','m')),
           length_mm INTEGER NOT NULL CHECK(length_mm > 0),
           width_mm INTEGER NOT NULL CHECK(width_mm > 0),
           depth_mm INTEGER NOT NULL CHECK(depth_mm > 0),
           created_at TEXT NOT NULL,
           updated_at TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS crop_placements (
           id TEXT PRIMARY KEY,
           growing_area_id TEXT NOT NULL REFERENCES growing_areas(id) ON DELETE CASCADE,
           plant_id TEXT NOT NULL,
           quantity INTEGER NOT NULL CHECK(quantity > 0),
           planted_on TEXT NOT NULL,
           notes TEXT NOT NULL DEFAULT '',
           created_at TEXT NOT NULL
         );
         INSERT OR IGNORE INTO schema_migrations(version, applied_at)
         VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
         INSERT OR IGNORE INTO schema_migrations(version, applied_at)
         VALUES (2, strftime('%Y-%m-%dT%H:%M:%fZ','now'));",
    )?;
    Ok(())
}

fn database_path(app: &tauri::App) -> Result<PathBuf, AppError> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|_| AppError::MissingDataDirectory)?;
    fs::create_dir_all(&directory)?;
    Ok(directory.join("horizon-garden.db"))
}

#[tauri::command]
fn load_setup(database: State<'_, Database>) -> Result<Option<GardenSetupSnapshot>, AppError> {
    let connection = database.0.lock().expect("database lock poisoned");
    let snapshot = connection
        .query_row(
            "SELECT w.id, p.id, g.id, a.id, w.name, p.name, g.name, a.name,
                    a.area_type, a.display_unit, a.length_mm, a.width_mm, a.depth_mm,
                    a.created_at, a.updated_at
             FROM growing_areas a
             JOIN gardens g ON g.id = a.garden_id
             JOIN properties p ON p.id = g.property_id
             JOIN workspaces w ON w.id = p.workspace_id
             ORDER BY a.created_at LIMIT 1",
            [],
            |row| {
                Ok(GardenSetupSnapshot {
                    workspace_id: row.get(0)?, property_id: row.get(1)?,
                    garden_id: row.get(2)?, growing_area_id: row.get(3)?,
                    workspace_name: row.get(4)?, property_name: row.get(5)?,
                    garden_name: row.get(6)?, growing_area_name: row.get(7)?,
                    growing_area_type: row.get(8)?, display_unit: row.get(9)?,
                    length_millimeters: row.get(10)?, width_millimeters: row.get(11)?,
                    depth_millimeters: row.get(12)?, created_at: row.get(13)?,
                    updated_at: row.get(14)?,
                })
            },
        )
        .optional()?;
    Ok(snapshot)
}

#[tauri::command]
fn save_setup(
    input: GardenSetupInput,
    database: State<'_, Database>,
) -> Result<GardenSetupSnapshot, AppError> {
    validate_input(&input)?;
    let mut connection = database.0.lock().expect("database lock poisoned");
    let transaction = connection.transaction()?;
    let existing = transaction
        .query_row(
            "SELECT w.id, p.id, g.id, a.id, a.created_at
             FROM growing_areas a JOIN gardens g ON g.id = a.garden_id
             JOIN properties p ON p.id = g.property_id
             JOIN workspaces w ON w.id = p.workspace_id LIMIT 1",
            [],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?, row.get::<_, String>(3)?, row.get::<_, String>(4)?)),
        )
        .optional()?;

    let now = Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true);
    let (workspace_id, property_id, garden_id, growing_area_id, created_at) = existing
        .unwrap_or_else(|| (Uuid::now_v7().to_string(), Uuid::now_v7().to_string(), Uuid::now_v7().to_string(), Uuid::now_v7().to_string(), now.clone()));

    transaction.execute(
        "INSERT INTO workspaces(id,name,created_at,updated_at) VALUES (?1,?2,?3,?4)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at",
        params![workspace_id, input.workspace_name, created_at, now],
    )?;
    transaction.execute(
        "INSERT INTO properties(id,workspace_id,name,created_at,updated_at) VALUES (?1,?2,?3,?4,?5)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at",
        params![property_id, workspace_id, input.property_name, created_at, now],
    )?;
    transaction.execute(
        "INSERT INTO gardens(id,property_id,name,created_at,updated_at) VALUES (?1,?2,?3,?4,?5)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at",
        params![garden_id, property_id, input.garden_name, created_at, now],
    )?;
    transaction.execute(
        "INSERT INTO growing_areas(id,garden_id,name,area_type,shape,display_unit,length_mm,width_mm,depth_mm,created_at,updated_at)
         VALUES (?1,?2,?3,?4,'rectangle',?5,?6,?7,?8,?9,?10)
         ON CONFLICT(id) DO UPDATE SET name=excluded.name, area_type=excluded.area_type,
         display_unit=excluded.display_unit, length_mm=excluded.length_mm,
         width_mm=excluded.width_mm, depth_mm=excluded.depth_mm, updated_at=excluded.updated_at",
        params![growing_area_id, garden_id, input.growing_area_name, input.growing_area_type, input.display_unit, input.length_millimeters, input.width_millimeters, input.depth_millimeters, created_at, now],
    )?;
    transaction.commit()?;

    Ok(GardenSetupSnapshot {
        workspace_id, property_id, garden_id, growing_area_id,
        workspace_name: input.workspace_name, property_name: input.property_name,
        garden_name: input.garden_name, growing_area_name: input.growing_area_name,
        growing_area_type: input.growing_area_type, display_unit: input.display_unit,
        length_millimeters: input.length_millimeters,
        width_millimeters: input.width_millimeters,
        depth_millimeters: input.depth_millimeters, created_at, updated_at: now,
    })
}

#[tauri::command]
fn load_placements(database: State<'_, Database>) -> Result<Vec<CropPlacement>, AppError> {
    let connection = database.0.lock().expect("database lock poisoned");
    let mut statement = connection.prepare(
        "SELECT id, growing_area_id, plant_id, quantity, planted_on, notes, created_at
         FROM crop_placements ORDER BY planted_on, created_at",
    )?;
    let rows = statement.query_map([], |row| {
        Ok(CropPlacement {
            id: row.get(0)?,
            growing_area_id: row.get(1)?,
            plant_id: row.get(2)?,
            quantity: row.get(3)?,
            planted_on: row.get(4)?,
            notes: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;
    rows.collect::<Result<Vec<_>, _>>().map_err(AppError::from)
}

#[tauri::command]
fn save_placement(
    input: CropPlacementInput,
    database: State<'_, Database>,
) -> Result<CropPlacement, AppError> {
    validate_placement(&input)?;
    let connection = database.0.lock().expect("database lock poisoned");
    let area_exists: bool = connection.query_row(
        "SELECT EXISTS(SELECT 1 FROM growing_areas WHERE id = ?1)",
        [&input.growing_area_id],
        |row| row.get(0),
    )?;
    if !area_exists {
        return Err(AppError::Validation("The selected growing area does not exist.".into()));
    }
    let placement = CropPlacement {
        id: Uuid::now_v7().to_string(),
        growing_area_id: input.growing_area_id.trim().to_owned(),
        plant_id: input.plant_id,
        quantity: input.quantity,
        planted_on: input.planted_on,
        notes: input.notes.trim().to_owned(),
        created_at: Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
    };
    connection.execute(
        "INSERT INTO crop_placements(id, growing_area_id, plant_id, quantity, planted_on, notes, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![placement.id, placement.growing_area_id, placement.plant_id, placement.quantity,
                placement.planted_on, placement.notes, placement.created_at],
    )?;
    Ok(placement)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let connection = Connection::open(database_path(app)?)?;
            migrate(&connection)?;
            app.manage(Database(Mutex::new(connection)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_setup,
            save_setup,
            load_placements,
            save_placement
        ])
        .run(tauri::generate_context!())
        .expect("error while running Horizon Garden");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_input() -> GardenSetupInput {
        GardenSetupInput {
            workspace_name: "Home Garden".into(),
            property_name: "Home".into(),
            garden_name: "Backyard".into(),
            growing_area_name: "Bed 1".into(),
            growing_area_type: "raised_bed".into(),
            display_unit: "ft".into(),
            length_millimeters: 2438,
            width_millimeters: 1219,
            depth_millimeters: 305,
        }
    }

    #[test]
    fn accepts_all_growing_area_types() {
        for area_type in [
            "raised_bed",
            "in_ground",
            "container",
            "greenhouse_zone",
            "indoor_box",
        ] {
            let mut input = valid_input();
            input.growing_area_type = area_type.into();
            assert!(validate_input(&input).is_ok());
        }
    }

    #[test]
    fn rejects_invalid_dimensions_at_native_boundary() {
        let mut input = valid_input();
        input.depth_millimeters = 0;
        assert!(matches!(validate_input(&input), Err(AppError::Validation(_))));
    }

    #[test]
    fn migration_is_idempotent() {
        let connection = Connection::open_in_memory().expect("in-memory database");
        migrate(&connection).expect("first migration");
        migrate(&connection).expect("second migration");
        let version: i64 = connection
            .query_row("SELECT MAX(version) FROM schema_migrations", [], |row| row.get(0))
            .expect("migration version");
        assert_eq!(version, 2);
    }

    #[test]
    fn rejects_unknown_plant_at_native_boundary() {
        let input = CropPlacementInput {
            growing_area_id: "area".into(),
            plant_id: "unknown".into(),
            quantity: 1,
            planted_on: "2026-09-13".into(),
            notes: String::new(),
        };
        assert!(matches!(validate_placement(&input), Err(AppError::Validation(_))));
    }
}
