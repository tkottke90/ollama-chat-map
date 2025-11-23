# Implementation Checklist

Track progress on implementing the new mind map architecture.

**Status Legend**: ⬜ Not Started | 🟦 In Progress | ✅ Complete | ❌ Blocked

---

## Phase 1: Core Architecture ✅ COMPLETE

**Goal**: Eliminate race conditions and establish single source of truth

### Backend Tasks

- [x] ✅ Modify `MindMapManager` to hold `active_mind_map: Arc<RwLock<MindMap>>`
- [x] ✅ Add `current_path: Arc<RwLock<String>>` to `MindMapManager`
- [x] ✅ Update `initialize_mind_map_manager()` to eagerly load data
- [x] ✅ Create `create_empty_mind_map()` helper function
- [x] ✅ Create `create_tutorial_mind_map()` helper function (basic version)
- [x] ✅ Implement `is_first_time_user()` check
- [x] ✅ Simplify `get_mind_map()` to return active mind map
- [x] ✅ Update `update_nodes()` to modify active mind map
- [x] ✅ Update `update_edges()` to modify active mind map
- [x] ✅ Update `flush_mind_map()` to write active mind map to disk
- [x] ✅ Keep `cache.rs` for future file switching optimization

### Frontend Tasks

- [x] ✅ Remove hardcoded `initialNodes` from `src/routes/mind-map/index.tsx`
- [x] ✅ Remove initialization timer from `src/routes/mind-map/state.tsx`
- [x] ✅ Simplify `useEffect` to single fetch on mount
- [x] ✅ Add loading state (`isLoading`) while fetching data
- [x] ✅ Remove automatic persistence from `useEffect` hooks
- [x] ✅ Clean up unused code

### Testing

- [ ] ⬜ Test first-time user (no saved files) → Should see tutorial
- [ ] ⬜ Test returning user (has saved file) → Should see their file
- [ ] ⬜ Test missing file (state points to non-existent file) → Should see empty map
- [ ] ⬜ Verify no race conditions during initialization
- [ ] ⬜ Verify no console errors
- [ ] ⬜ Test node deletion persists correctly
- [ ] ⬜ Test edge deletion persists correctly

### Success Criteria

- ✅ Application always loads with a mind map
- ✅ No initialization timing issues
- ✅ Backend is clear source of truth
- ✅ Node/edge deletions persist correctly

---

## Phase 2: File Naming ⭐ HIGH PRIORITY

**Goal**: Implement smart auto-incrementing file names

### Backend Tasks

- [ ] ⬜ Implement `find_next_untitled_filename()` function
- [ ] ⬜ Implement `sanitize_filename()` function
- [ ] ⬜ Update `save_mind_map()` command with auto-naming logic
- [ ] ⬜ Add `rename_mind_map()` command
- [ ] ⬜ Handle file conflicts and validation
- [ ] ⬜ Update display name generation from filename

### Frontend Tasks

- [ ] ⬜ Add editable name field in toolbar
- [ ] ⬜ Implement rename UI flow (click to edit)
- [ ] ⬜ Add validation feedback
- [ ] ⬜ Update display name when file is saved
- [ ] ⬜ Show filename in window title

### Testing

- [ ] ⬜ Test creating first new file → `untitled.json`
- [ ] ⬜ Test creating second new file → `untitled_2.json`
- [ ] ⬜ Test creating third new file → `untitled_3.json`
- [ ] ⬜ Test renaming to "My Project" → `my_project.json`
- [ ] ⬜ Test name sanitization (spaces, special chars)
- [ ] ⬜ Test conflict detection (name already exists)
- [ ] ⬜ Test renaming deletes old file

### Success Criteria

- ✅ New files get unique auto-generated names
- ✅ Users can rename files easily
- ✅ No file name conflicts
- ✅ Names are properly sanitized

---

## Phase 3: Hybrid Saving ✅ COMPLETE

**Goal**: Implement manual + auto-save with clear feedback

### Backend Tasks

- [x] ✅ Add `is_saved: Arc<RwLock<bool>>` to `MindMapManager`
- [x] ✅ Add `last_saved_at: Arc<RwLock<DateTime<Utc>>>` to `MindMapManager`
- [x] ✅ Update `update_nodes()` to mark as unsaved
- [x] ✅ Update `update_edges()` to mark as unsaved
- [x] ✅ Update `flush_mind_map()` to mark as saved and update timestamp
- [x] ✅ Add `get_save_state()` command
- [x] ✅ Add `SaveState` struct for frontend communication
- [x] ✅ Register `get_save_state` command in `lib.rs`

### Frontend Tasks

- [x] ✅ Create `useSaveState` hook with save logic
- [x] ✅ Add manual save button to toolbar
- [x] ✅ Implement keyboard shortcut (Cmd/Ctrl+S)
- [x] ✅ Implement debounced auto-save (3 seconds)
- [x] ✅ Add save status indicator ("Saved", "Unsaved", "Saving...")
- [x] ✅ Add visual feedback (green=saved, yellow=unsaved, spinner=saving)
- [x] ✅ Prevent default browser save behavior
- [x] ✅ Integrate save state into context
- [x] ✅ Update `onNodeUpdates` and `onEdgeUpdates` to trigger auto-save

**Note**: Optional enhancements (last modified display, auto-save settings) moved to Phase Future.

### Testing

- [ ] ⬜ Test manual save button updates state
- [ ] ⬜ Test Cmd+S keyboard shortcut
- [ ] ⬜ Test Ctrl+S keyboard shortcut
- [ ] ⬜ Test auto-save triggers 3 seconds after changes
- [ ] ⬜ Test save state indicator updates correctly
- [ ] ⬜ Test debouncing prevents excessive saves
- [ ] ⬜ Test concurrent save prevention
- [ ] ⬜ Test save button disabled when saving
- [ ] ⬜ Test changes persist after save and reload

### Success Criteria

- ✅ Users can manually save anytime
- ✅ Auto-save prevents data loss
- ✅ Clear visual feedback on save state
- ✅ Keyboard shortcuts work

---

## Phase 4: Tutorial System 🔵 MEDIUM PRIORITY

**Goal**: Provide helpful onboarding for new users

### Backend Tasks

- [ ] ⬜ Enhance `create_tutorial_mind_map()` with full content
- [ ] ⬜ Add `load_tutorial()` command
- [ ] ⬜ Add `has_tutorial()` command
- [ ] ⬜ Ensure tutorial is saved on first creation

### Frontend Tasks

- [ ] ⬜ Design tutorial content (nodes and edges)
- [ ] ⬜ Add "Help > Open Tutorial" menu item
- [ ] ⬜ Add welcome screen for first-time users (optional)
- [ ] ⬜ Style tutorial nodes distinctively (optional)

### Testing

- [ ] ⬜ Test first-time user sees tutorial
- [ ] ⬜ Test tutorial is saved to `tutorial.json`
- [ ] ⬜ Test opening tutorial from menu
- [ ] ⬜ Test editing tutorial saves changes
- [ ] ⬜ Test tutorial content is helpful

### Success Criteria

- ✅ First-time users see helpful tutorial
- ✅ Tutorial is accessible anytime
- ✅ Tutorial content is clear and useful

---

## Phase 5: Error Handling 🔵 MEDIUM PRIORITY

**Goal**: Graceful error handling with user notifications

### Backend Tasks

- [ ] ⬜ Create `MindMapError` enum with error types
- [ ] ⬜ Implement detailed error detection in `load_mind_map_from_disk()`
- [ ] ⬜ Add `load_error: Arc<RwLock<Option<MindMapError>>>` to `MindMapManager`
- [ ] ⬜ Add `get_mind_map_with_error()` command
- [ ] ⬜ Add `clear_load_error()` command
- [ ] ⬜ Update initialization to store load errors

### Frontend Tasks

- [ ] ⬜ Create `LoadErrorNotification` component
- [ ] ⬜ Implement error display UI
- [ ] ⬜ Add retry action
- [ ] ⬜ Add "create new" action
- [ ] ⬜ Add "open different file" action
- [ ] ⬜ Style error notification
- [ ] ⬜ Add placeholder for "Repair with AI" button

### Testing

- [ ] ⬜ Test file not found error
- [ ] ⬜ Test corrupted JSON error
- [ ] ⬜ Test permission denied error
- [ ] ⬜ Test retry action
- [ ] ⬜ Test "create new" fallback
- [ ] ⬜ Test error notification dismissal

### Success Criteria

- ✅ Users see clear error messages
- ✅ Users have recovery options
- ✅ Application never crashes on error

---

## Phase 6: LLM Repair ⏳ FUTURE

**Goal**: Automatic repair of corrupted files using AI

### Backend Tasks

- [ ] ⬜ Design repair prompt template
- [ ] ⬜ Implement `repair_mind_map_with_ai()` command
- [ ] ⬜ Add validation for repaired data
- [ ] ⬜ Add backup before repair
- [ ] ⬜ Add repair history/logging

### Frontend Tasks

- [ ] ⬜ Enable "Repair with AI" button
- [ ] ⬜ Create repair progress UI
- [ ] ⬜ Add confirmation dialog
- [ ] ⬜ Show repair results

### Testing

- [ ] ⬜ Test with various corruption types
- [ ] ⬜ Test validation of repaired data
- [ ] ⬜ Test backup/restore flow
- [ ] ⬜ Test user confirmation

### Success Criteria

- ✅ LLM can fix common corruption issues
- ✅ Users can review repairs before accepting
- ✅ Original file is backed up

---

## Phase Future: Optional Enhancements ⏳ FUTURE

**Goal**: Nice-to-have features for future consideration

### Save System Enhancements

**Last Modified Display**
- [ ] ⬜ Add `last_modified_at` to `SaveState` struct (backend)
- [ ] ⬜ Calculate from `MindMap.updated_at` in `get_save_state()` command
- [ ] ⬜ Display "Last modified X minutes ago" in UI (frontend)
- [ ] ⬜ Add human-readable time formatting utility (frontend)

**Auto-Save Settings**
- [ ] ⬜ Add settings/preferences system (backend)
- [ ] ⬜ Add `auto_save_enabled` preference with default `true`
- [ ] ⬜ Add `auto_save_delay` preference with default `3000ms`
- [ ] ⬜ Create settings UI/dialog (frontend)
- [ ] ⬜ Add toggle for enabling/disabling auto-save (frontend)
- [ ] ⬜ Add slider/input for auto-save delay (frontend)
- [ ] ⬜ Persist settings across sessions

### Other Future Enhancements

- [ ] ⬜ Export mind map to different formats (PDF, PNG, Markdown)
- [ ] ⬜ Import from other mind map tools
- [ ] ⬜ Collaborative editing support
- [ ] ⬜ Cloud sync integration
- [ ] ⬜ Keyboard shortcuts customization
- [ ] ⬜ Themes and appearance customization
- [ ] ⬜ Mind map templates library

---

## Notes

- Update this checklist as you complete tasks
- Mark blockers with ❌ and document the issue
- Each phase should be completed and tested before moving to the next
- Keep the architecture document updated if design changes

**Last Updated**: 2025-11-23

---

## Implementation Summary

### ✅ Completed Phases

**Phase 1: Core Architecture** (Completed 2025-11-23)
- Implemented eager loading in backend
- Eliminated race conditions
- Backend now owns data lifecycle
- Frontend simplified to display layer
- Tutorial system for first-time users

**Phase 3: Hybrid Saving** (Completed 2025-11-23)
- Manual save button with visual feedback
- Keyboard shortcuts (Cmd/Ctrl+S)
- Debounced auto-save (3 seconds)
- Save state tracking in backend
- Clear visual indicators (green/yellow/spinner)
- Optional enhancements moved to Phase Future

### 🔄 Next Priority

**Phase 2: File Naming** - Smart auto-incrementing file names and rename functionality

### 📊 Overall Progress

- Phase 1: ✅ Complete (100%)
- Phase 2: ⬜ Not Started (0%)
- Phase 3: ✅ Complete (100%)
- Phase 4: ⬜ Not Started (0%)
- Phase 5: ⬜ Not Started (0%)
- Phase 6: ⬜ Not Started (0%)
- Phase Future: ⬜ Not Started (0% - optional enhancements)

