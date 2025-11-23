# Mind Map Application Architecture Design

**Version:** 1.0  
**Date:** 2025-11-21 
**Status:** Approved for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Core Requirements](#core-requirements)
3. [Architecture Principles](#architecture-principles)
4. [System Architecture](#system-architecture)
5. [Initialization Flow](#initialization-flow)
6. [Feature Specifications](#feature-specifications)
7. [Implementation Phases](#implementation-phases)
8. [Technical Details](#technical-details)

---

## Overview

This document outlines the architecture for a reliable, user-friendly mind map application built with Tauri (Rust backend) and React (TypeScript frontend). The design addresses previous issues with race conditions, initialization bugs, and data persistence.

### Key Design Goals

- **Reliability**: Eliminate race conditions and initialization bugs
- **User Experience**: Always have an open mind map, graceful error handling
- **Maintainability**: Clear separation of concerns, single source of truth
- **Extensibility**: Foundation for future features (LLM-based repair, collaboration, etc.)

---

## Core Requirements

### 1. Always Have an Open Mind Map
The application must always display a mind map. There should never be a "null" or "undefined" state where no mind map is loaded.

### 2. Reload Previous Mind Map on Boot
When the user reopens the application, it should automatically load the mind map they were working on in their last session.

### 3. Load Default on Failure
If the previous mind map cannot be loaded (file not found, corrupted, etc.), the application should gracefully fall back to:
- **First-time users**: Tutorial mind map with helpful guidance
- **Returning users**: Empty mind map

### 4. Hybrid Saving System
- **Manual Save**: User can explicitly save via button or keyboard shortcut (Cmd/Ctrl+S)
- **Auto-Save**: Debounced automatic saving after changes (3 seconds idle)
- **Status Indicator**: Clear visual feedback on save state

### 5. Smart File Naming
- **Auto-increment**: New files are named `untitled.json`, `untitled_2.json`, etc.
- **User Rename**: Users can provide custom names at any time
- **Sanitization**: File names are sanitized (lowercase, underscores, alphanumeric)

### 6. Error Handling with Future LLM Repair
- **User Notification**: Clear error messages when loading fails
- **Fallback Options**: Create new, retry, or open different file
- **Future Feature**: LLM-based automatic repair of corrupted files

---

## Architecture Principles

### Single Source of Truth Pattern

**Backend owns the data, Frontend displays it**

```
Backend (Rust)
  ├─ MindMapManager: Always holds ONE active mind map
  ├─ Never returns null/undefined
  └─ Handles all persistence logic
       ↓
  Tauri Commands
       ↓
Frontend (React)
  ├─ Receives data from backend
  ├─ Sends updates to backend
  ├─ NO initialization logic
  └─ NO hardcoded defaults
```

### Key Principles

1. **Eager Loading**: Backend loads mind map data during initialization, before frontend starts
2. **No Lazy Loading**: Eliminates race conditions and timing issues
3. **Clear Ownership**: Backend owns data lifecycle, frontend owns display
4. **Graceful Degradation**: Always fall back to working state, never crash
5. **Explicit Persistence**: Save operations are intentional, not accidental

---

## System Architecture

### Backend Structure (Rust)

```rust
pub struct MindMapManager {
    // Current active mind map (always present, never null)
    active_mind_map: Arc<RwLock<MindMap>>,
    
    // Path to current file
    current_path: Arc<RwLock<String>>,
    
    // Save state tracking
    is_saved: Arc<RwLock<bool>>,
    last_saved_at: Arc<RwLock<DateTime<Utc>>>,
    
    // Recent files list
    recent_files: Arc<RwLock<Vec<String>>>,
    
    // Optional: Cache for quick file switching
    cache: Cache<String, Arc<MindMap>>,
    
    // Load error (if any) for frontend notification
    load_error: Arc<RwLock<Option<MindMapError>>>,
}
```

### Frontend Structure (TypeScript/React)

```typescript
interface MindMapContextValue {
  // Display state
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  
  // Save state
  isSaved: boolean;
  lastSavedAt: Date | null;
  
  // Metadata
  fileName: string;
  name: string;
  
  // Error handling
  loadError: LoadError | null;
  
  // Actions
  save: () => Promise<void>;
  rename: (newName: string) => Promise<void>;
  load: (fileName: string) => Promise<void>;
  clearError: () => void;
  retryLoad: (fileName: string) => Promise<void>;
}
```

---

## Initialization Flow

### Phase 1: Backend Initialization (Eager Loading)

```
1. App Starts
   ↓
2. Load active_file_state.json
   ├─ Contains: { currentMindMapPath: "file.json", recentFiles: [...] }
   └─ If not found: Use default state
   ↓
3. Load Mind Map Data
   ├─ If currentMindMapPath exists:
   │  ├─ Try load from disk
   │  ├─ On success: Use loaded data
   │  └─ On error: Store error, create fallback
   └─ If no currentMindMapPath:
      ├─ Check if first-time user
      ├─ First-time: Create tutorial mind map
      └─ Returning: Create empty mind map
   ↓
4. Create MindMapManager
   └─ Always has active mind map loaded
```

### Phase 2: Frontend Initialization (Simple Fetch)

```
1. React App Mounts
   ↓
2. useMindMapState Hook Initializes
   ├─ NO hardcoded initialNodes
   ├─ NO initialization timer
   └─ State starts empty: nodes=[], edges=[]
   ↓
3. useEffect Fires (Once on Mount)
   ├─ Call: invoke('get_mind_map_with_error')
   ├─ Receive: { mindMap, error }
   └─ If error: Show notification
   ↓
4. Update React State
   ├─ setNodes(mindMap.nodes)
   ├─ setEdges(mindMap.edges)
   └─ setIsLoading(false)
   ↓
5. Display Mind Map
   └─ User sees their data immediately
```

### Key Differences from Previous System

| Aspect | Previous System | New System |
|--------|----------------|------------|
| **Data Loading** | Lazy (on-demand) | Eager (during init) |
| **Initial State** | Hardcoded demo node | Empty, fetched from backend |
| **Timing** | 100ms timer guard | No timing issues |
| **Race Conditions** | Multiple state updates | Single fetch |
| **Source of Truth** | Unclear (cache vs state) | Backend always |

---

## Feature Specifications

### 1. Hybrid Saving System

#### Manual Save
- **Trigger**: User clicks "Save" button or presses Cmd/Ctrl+S
- **Behavior**: Immediately flush to disk
- **Feedback**: Button shows "✓ Saved" state
- **Use Case**: User wants to ensure work is saved before closing

#### Auto-Save
- **Trigger**: 3 seconds after last change (debounced)
- **Condition**: Only if `isSaved === false`
- **Behavior**: Silently save in background
- **Feedback**: Subtle "Saving..." indicator
- **Use Case**: Prevent data loss during active editing

#### Save State Tracking
```rust
// Backend tracks:
is_saved: bool              // Has data been written to disk?
last_saved_at: DateTime     // When was last save?

// Frontend displays:
isSaved: boolean            // Show save button state
lastSavedAt: Date | null    // Show "Last saved 2 minutes ago"
```

#### Implementation
```typescript
// Manual save
const handleSave = async () => {
  await invoke('update_nodes', { nodes: getNodes() });
  await invoke('update_edges', { edges: getEdges() });
  await invoke('flush_mind_map');
};

// Auto-save (debounced)
const debouncedAutoSave = useMemo(
  () => debounce(async () => {
    if (!isSaved && autoSaveEnabled) {
      await handleSave();
    }
  }, 3000),
  [isSaved, autoSaveEnabled]
);

useEffect(() => {
  debouncedAutoSave();
}, [nodes, edges, debouncedAutoSave]);
```

---

### 2. Default Mind Maps & Tutorial System

#### Empty Default Mind Map
```rust
fn create_empty_mind_map() -> MindMap {
    MindMap {
        id: 0,
        name: "Untitled".to_string(),
        description: "".to_string(),
        file_name: "".to_string(),
        nodes: serde_json::json!([]),
        edges: serde_json::json!([]),
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    }
}
```

#### Tutorial Mind Map
```rust
fn create_tutorial_mind_map() -> MindMap {
    MindMap {
        id: 0,
        name: "Tutorial".to_string(),
        description: "Learn how to use AI Mind Map".to_string(),
        file_name: "tutorial.json".to_string(),
        nodes: serde_json::json!([
            {
                "id": "welcome",
                "type": "llmPrompt",
                "position": { "x": 0, "y": 0 },
                "data": {
                    "userMessage": {
                        "role": "user",
                        "content": "Welcome to AI Mind Map! ..."
                    }
                }
            },
            // ... more tutorial nodes
        ]),
        edges: serde_json::json!([...]),
        created_at: Utc::now().to_rfc3339(),
        updated_at: Utc::now().to_rfc3339(),
    }
}
```

#### First-Time User Detection
```rust
fn is_first_time_user(app: &AppHandle) -> bool {
    let app_data_dir = match app.path().app_data_dir() {
        Ok(dir) => dir,
        Err(_) => return true,
    };

    // Check if any .json files exist (excluding state file)
    if let Ok(entries) = std::fs::read_dir(&app_data_dir) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".json") && name != "active_file_state.json" {
                    return false; // Found a mind map file
                }
            }
        }
    }

    true // No mind map files found
}
```

#### Tutorial Management
- **Creation**: Automatically created for first-time users
- **Persistence**: Saved to `tutorial.json` on disk
- **Access**: Available via "Help > Open Tutorial" menu
- **Modification**: Users can edit tutorial, changes are saved
- **Recreation**: Never automatically overwritten

---

### 3. Auto-Incremented File Naming

#### Naming Strategy

| Scenario | File Name | Display Name |
|----------|-----------|--------------|
| First save (no name) | `untitled.json` | "Untitled" |
| Second new file | `untitled_2.json` | "Untitled 2" |
| Third new file | `untitled_3.json` | "Untitled 3" |
| User renames to "My Project" | `my_project.json` | "My Project" |
| User renames to "Q1 Planning!" | `q1_planning.json` | "Q1 Planning!" |

#### Implementation
```rust
fn find_next_untitled_filename(app: &AppHandle) -> Result<String, String> {
    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    let mut counter = 1;
    loop {
        let filename = if counter == 1 {
            "untitled.json".to_string()
        } else {
            format!("untitled_{}.json", counter)
        };

        let file_path = app_data_dir.join(&filename);
        if !file_path.exists() {
            return Ok(filename);
        }

        counter += 1;
        if counter > 10000 {
            return Err("Too many untitled files".to_string());
        }
    }
}

fn sanitize_filename(name: &str) -> String {
    let mut sanitized = name.to_lowercase();
    sanitized = sanitized.replace(' ', "_");
    sanitized = sanitized.chars()
        .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-')
        .collect();

    if !sanitized.ends_with(".json") {
        sanitized.push_str(".json");
    }

    sanitized
}
```

#### Rename Flow
1. User clicks on mind map name in toolbar
2. Name becomes editable input field
3. User types new name and presses Enter
4. Frontend calls `rename_mind_map(newName)`
5. Backend:
   - Sanitizes filename
   - Checks for conflicts
   - Deletes old file (if renaming)
   - Saves with new name
   - Updates state
6. Frontend updates display

---

### 4. Error Handling & Recovery

#### Error Types
```rust
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "message")]
pub enum MindMapError {
    FileNotFound(String),       // File doesn't exist
    CorruptedData(String),      // Invalid MindMap structure
    PermissionDenied(String),   // Can't read/write file
    InvalidJson(String),        // JSON syntax error
    UnknownError(String),       // Unexpected error
}
```

#### Error Handling Flow
```
1. Error Occurs During Load
   ↓
2. Backend Detects Error Type
   ├─ Log detailed error to console
   ├─ Store error in MindMapManager
   └─ Create fallback mind map
   ↓
3. Frontend Receives Data
   ├─ mindMap: Fallback data (empty or tutorial)
   └─ error: Error details
   ↓
4. Display Error Notification
   ├─ User-friendly message
   ├─ Error icon and details
   └─ Action buttons
   ↓
5. User Actions
   ├─ "Create New" → Clear error, use fallback
   ├─ "Try Again" → Retry loading same file
   ├─ "Repair with AI" → (Future) LLM fixes file
   └─ "Open Different File" → File picker
```

#### Error Notification UI
```typescript
function LoadErrorNotification() {
  const { loadError, clearError, retryLoad, repairWithAI } = useMindMapContext();

  if (!loadError) return null;

  const isLLMRecoverable =
    loadError.type === 'CorruptedData' ||
    loadError.type === 'InvalidJson';

  return (
    <div className="error-notification">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3>Failed to Load Mind Map</h3>
        <p>{loadError.message}</p>

        <div className="error-actions">
          <button onClick={clearError}>
            Create New Mind Map
          </button>

          <button onClick={() => retryLoad(fileName)}>
            Try Again
          </button>

          {isLLMRecoverable && (
            <button onClick={() => repairWithAI(fileName)} disabled>
              🤖 Repair with AI (Coming Soon)
            </button>
          )}

          <button onClick={openFilePicker}>
            Open Different File
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Future: LLM-Based Repair
**Placeholder for future implementation:**

1. Read corrupted file as raw text
2. Send to LLM with prompt:
   ```
   This JSON file is corrupted. Please fix it and return valid JSON.
   The file should match this structure: { id, name, description, fileName, nodes, edges, created_at, updated_at }

   Corrupted file:
   [corrupted content]
   ```
3. Parse LLM response
4. Validate structure matches `MindMap`
5. Save repaired file
6. Reload mind map
7. Show success message

---

## Implementation Phases

### Phase 1: Core Architecture ⭐ **HIGHEST PRIORITY**

**Goal**: Eliminate race conditions and establish single source of truth

**Backend Tasks**:
- [ ] Modify `MindMapManager` to hold `active_mind_map: Arc<RwLock<MindMap>>`
- [ ] Update `initialize_mind_map_manager()` to eagerly load data
- [ ] Create `create_empty_mind_map()` helper function
- [ ] Simplify `get_mind_map()` to return active mind map
- [ ] Update `update_nodes()` and `update_edges()` to modify active mind map
- [ ] Update `flush_mind_map()` to write active mind map to disk

**Frontend Tasks**:
- [ ] Remove hardcoded `initialNodes` from `src/routes/mind-map/index.tsx`
- [ ] Remove initialization timer from `src/routes/mind-map/state.tsx`
- [ ] Simplify `useEffect` to single fetch on mount
- [ ] Add loading state while fetching data
- [ ] Remove automatic persistence from `useEffect` hooks

**Testing**:
- [ ] Test first-time user (no saved files)
- [ ] Test returning user (has saved file)
- [ ] Test missing file (state points to non-existent file)
- [ ] Verify no race conditions during initialization

**Success Criteria**:
- ✅ Application always loads with a mind map
- ✅ No initialization timing issues
- ✅ Backend is clear source of truth

---

### Phase 2: File Naming ⭐ **HIGH PRIORITY**

**Goal**: Implement smart auto-incrementing file names

**Backend Tasks**:
- [ ] Implement `find_next_untitled_filename()` function
- [ ] Implement `sanitize_filename()` function
- [ ] Update `save_mind_map()` command with auto-naming logic
- [ ] Add `rename_mind_map()` command
- [ ] Handle file conflicts and validation

**Frontend Tasks**:
- [ ] Add editable name field in toolbar
- [ ] Implement rename UI flow
- [ ] Add validation feedback
- [ ] Update display name when file is saved

**Testing**:
- [ ] Test creating multiple new files (untitled, untitled_2, etc.)
- [ ] Test renaming files
- [ ] Test name sanitization (spaces, special chars)
- [ ] Test conflict detection

**Success Criteria**:
- ✅ New files get unique auto-generated names
- ✅ Users can rename files easily
- ✅ No file name conflicts

---

### Phase 3: Hybrid Saving ⭐ **HIGH PRIORITY**

**Goal**: Implement manual + auto-save with clear feedback

**Backend Tasks**:
- [ ] Add `is_saved: Arc<RwLock<bool>>` to `MindMapManager`
- [ ] Add `last_saved_at: Arc<RwLock<DateTime<Utc>>>` to `MindMapManager`
- [ ] Update `update_nodes()` and `update_edges()` to mark as unsaved
- [ ] Update `flush_mind_map()` to mark as saved
- [ ] Add `get_save_state()` command

**Frontend Tasks**:
- [ ] Add manual save button to toolbar
- [ ] Implement keyboard shortcut (Cmd/Ctrl+S)
- [ ] Implement debounced auto-save (3 seconds)
- [ ] Add save status indicator ("Saved", "Unsaved", "Saving...")
- [ ] Add "Last saved X minutes ago" display
- [ ] Add settings toggle for auto-save

**Testing**:
- [ ] Test manual save button
- [ ] Test keyboard shortcut
- [ ] Test auto-save triggers after changes
- [ ] Test save state indicator updates
- [ ] Test disabling auto-save

**Success Criteria**:
- ✅ Users can manually save anytime
- ✅ Auto-save prevents data loss
- ✅ Clear visual feedback on save state

---

### Phase 4: Tutorial System 🔵 **MEDIUM PRIORITY**

**Goal**: Provide helpful onboarding for new users

**Backend Tasks**:
- [ ] Create `create_tutorial_mind_map()` function
- [ ] Implement `is_first_time_user()` check
- [ ] Add tutorial creation to initialization
- [ ] Add `load_tutorial()` command
- [ ] Add `has_tutorial()` command

**Frontend Tasks**:
- [ ] Design tutorial content (nodes and edges)
- [ ] Add "Help > Open Tutorial" menu item
- [ ] Add welcome screen for first-time users (optional)

**Testing**:
- [ ] Test first-time user sees tutorial
- [ ] Test tutorial is saved to disk
- [ ] Test opening tutorial from menu
- [ ] Test editing tutorial doesn't break it

**Success Criteria**:
- ✅ First-time users see helpful tutorial
- ✅ Tutorial is accessible anytime
- ✅ Tutorial content is clear and useful

---

### Phase 5: Error Handling 🔵 **MEDIUM PRIORITY**

**Goal**: Graceful error handling with user notifications

**Backend Tasks**:
- [ ] Create `MindMapError` enum with error types
- [ ] Implement detailed error detection in `load_mind_map_from_disk()`
- [ ] Add `load_error: Arc<RwLock<Option<MindMapError>>>` to `MindMapManager`
- [ ] Add `get_mind_map_with_error()` command
- [ ] Add `clear_load_error()` command

**Frontend Tasks**:
- [ ] Create `LoadErrorNotification` component
- [ ] Implement error display UI
- [ ] Add retry action
- [ ] Add "create new" action
- [ ] Add "open different file" action
- [ ] Style error notification

**Testing**:
- [ ] Test file not found error
- [ ] Test corrupted JSON error
- [ ] Test permission denied error
- [ ] Test retry action
- [ ] Test fallback to new mind map

**Success Criteria**:
- ✅ Users see clear error messages
- ✅ Users have recovery options
- ✅ Application never crashes on error

---

### Phase 6: LLM Repair ⏳ **FUTURE / LOW PRIORITY**

**Goal**: Automatic repair of corrupted files using AI

**Backend Tasks**:
- [ ] Design repair prompt template
- [ ] Implement `repair_mind_map_with_ai()` command
- [ ] Add validation for repaired data
- [ ] Add backup before repair
- [ ] Add repair history/logging

**Frontend Tasks**:
- [ ] Add "Repair with AI" button to error notification
- [ ] Create repair progress UI
- [ ] Add confirmation dialog
- [ ] Show repair results

**Testing**:
- [ ] Test with various corruption types
- [ ] Test validation of repaired data
- [ ] Test backup/restore flow
- [ ] Test user confirmation

**Success Criteria**:
- ✅ LLM can fix common corruption issues
- ✅ Users can review repairs before accepting
- ✅ Original file is backed up

---

## Technical Details

### Backend File Structure

```
src-tauri/src/active_file/
├── mod.rs              # Module exports and initialization
├── types.rs            # MindMap and ActiveFileState structs
├── manager.rs          # MindMapManager implementation
├── persistence.rs      # Disk I/O operations
├── cache.rs            # Cache operations (may be removed)
└── commands.rs         # Tauri command handlers
```

### Key Backend Functions

```rust
// Initialization
pub fn initialize_mind_map_manager<R: tauri::Runtime>(app: &tauri::App<R>) -> MindMapManager

// Helpers
fn create_empty_mind_map() -> MindMap
fn create_tutorial_mind_map() -> MindMap
fn is_first_time_user(app: &AppHandle) -> bool
fn find_next_untitled_filename(app: &AppHandle) -> Result<String, String>
fn sanitize_filename(name: &str) -> String

// Commands
#[tauri::command] pub fn get_mind_map(manager: State<MindMapManager>) -> Result<MindMap, String>
#[tauri::command] pub fn get_mind_map_with_error(manager: State<MindMapManager>) -> Result<Value, String>
#[tauri::command] pub fn update_nodes(manager: State<MindMapManager>, nodes: Value) -> Result<(), String>
#[tauri::command] pub fn update_edges(manager: State<MindMapManager>, edges: Value) -> Result<(), String>
#[tauri::command] pub fn flush_mind_map(manager: State<MindMapManager>, app: AppHandle) -> Result<(), String>
#[tauri::command] pub fn save_mind_map(manager: State<MindMapManager>, app: AppHandle, name: Option<String>) -> Result<String, String>
#[tauri::command] pub fn rename_mind_map(manager: State<MindMapManager>, app: AppHandle, new_name: String) -> Result<String, String>
#[tauri::command] pub fn load_mind_map(manager: State<MindMapManager>, app: AppHandle, file_name: String) -> Result<(), String>
#[tauri::command] pub fn load_tutorial(manager: State<MindMapManager>, app: AppHandle) -> Result<(), String>
```

### Frontend File Structure

```
src/routes/mind-map/
├── index.tsx           # Main mind map component
├── state.tsx           # useMindMapState hook
└── components/
    ├── Toolbar.tsx     # Save button, name, etc.
    ├── ErrorNotification.tsx
    └── SaveIndicator.tsx
```

### Key Frontend Hooks

```typescript
// Main state hook
function useMindMapState(): {
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  isSaved: boolean;
  fileName: string;
  name: string;
  loadError: LoadError | null;
  save: () => Promise<void>;
  rename: (newName: string) => Promise<void>;
  // ... other methods
}

// Context
const MindMapContext = createContext<MindMapContextValue | null>(null);
export const useMindMapContext = () => useContext(MindMapContext);
```

---

## Data Flow Diagrams

### Initialization Flow

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND INIT                          │
│  1. Load active_file_state.json                         │
│  2. Try load previous mind map                          │
│  3. On error: Create fallback (empty or tutorial)       │
│  4. MindMapManager always has active mind map           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND INIT                          │
│  1. Call get_mind_map_with_error()                      │
│  2. Receive { mindMap, error }                          │
│  3. Display mind map                                    │
│  4. Show error notification if error exists             │
└─────────────────────────────────────────────────────────┘
```

### Save Flow

```
┌─────────────────────────────────────────────────────────┐
│                   USER MAKES CHANGES                     │
│  - Add/remove/edit nodes                                │
│  - Connect edges                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND UPDATES                        │
│  - setNodes() / setEdges()                              │
│  - Mark as unsaved                                      │
│  - Start auto-save timer                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              SAVE TRIGGER (Manual or Auto)               │
│  - Manual: User clicks save or Cmd/Ctrl+S              │
│  - Auto: 3 seconds after last change                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  BACKEND PERSISTENCE                     │
│  1. update_nodes() - Update in memory                   │
│  2. update_edges() - Update in memory                   │
│  3. flush_mind_map() - Write to disk                    │
│  4. Mark as saved                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Benefits of This Architecture

### 1. Eliminates Race Conditions
- Backend loads data **before** frontend starts
- Frontend just displays what backend provides
- No timing issues, no initialization guards

### 2. Single Source of Truth
- Backend always has the active mind map
- Frontend is just a view layer
- Clear ownership of data

### 3. Predictable Initialization
- Always follows the same path
- Easy to debug (check backend logs)
- No complex state machines in frontend

### 4. Graceful Fallbacks
- File not found? → Load default
- Corrupted data? → Load default
- No previous session? → Load default
- All handled in one place (backend init)

### 5. Better User Experience
- Faster startup (data pre-loaded)
- No flash of wrong content
- Clear loading states
- Reliable persistence

### 6. Easier Testing
- Backend initialization is pure Rust (easy to unit test)
- Frontend is simple data display (easy to test)
- No complex async timing to mock

### 7. Maintainable
- Clear separation of concerns
- Each component has single responsibility
- Easy to add new features

### 8. Extensible
- Foundation for collaboration features
- Easy to add LLM-based features
- Can add undo/redo system
- Can add version history

---

## Migration Notes

### Breaking Changes
- Frontend `initialNodes` will be removed
- Initialization timer will be removed
- `useEffect` persistence hooks will be simplified

### Backward Compatibility
- Existing mind map files will work without changes
- `active_file_state.json` format remains the same
- No data migration needed

### Rollback Plan
If issues arise during implementation:
1. Keep old code in git history
2. Can revert individual phases
3. Each phase is independently testable

---

## Appendix

### Related Documents
- [ReactFlow Documentation](https://reactflow.dev/)
- [Tauri Documentation](https://tauri.app/)
- [Rust mini_moka Cache](https://docs.rs/mini-moka/)

### Glossary
- **Eager Loading**: Loading data during initialization, before it's needed
- **Lazy Loading**: Loading data on-demand, when it's first accessed
- **Race Condition**: Bug where timing of operations affects correctness
- **Single Source of Truth**: One authoritative source for each piece of data
- **Debouncing**: Delaying action until after a period of inactivity

### Version History
- **v1.0** (2024-01-15): Initial architecture design

---

**End of Document**


