use tauri::menu::Submenu;
use tauri::{Emitter, Manager};
use crate::active_file::{MindMapManager, create_empty_mind_map, persist_active_file_state};

pub(crate) fn on_debug_viewport<R: tauri::Runtime>(
    app_handle: &tauri::AppHandle<R>,
    menu: Submenu<R>,
) {
  // Get the debugViewport checkbox item
  if let Some(item) = menu.get("debugViewport") {
    if let Some(check_item) = item.as_check_menuitem() {
      // Get the current checked state
      let is_checked = check_item.is_checked().unwrap_or(false);

      // Emit event to frontend
      let _ = app_handle.emit("aiMindMap://window/updateViewportDisplay", is_checked);

      println!("Debug viewport toggled: {}", match is_checked {
        true => "ON",
        false => "OFF"
      });
    }
  }
}

pub (crate) fn on_new<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
  println!("📄 New menu item clicked");

  // Get the MindMapManager from app state
  let manager = app_handle.state::<MindMapManager>();

  // Create a new empty mind map
  let new_mind_map = create_empty_mind_map();

  // Set as active mind map with empty path (unsaved)
  manager.set_active_mind_map(new_mind_map.clone(), String::new());

  // Persist the updated ActiveFileState to disk
  let state = manager.get_state();
  if let Err(e) = persist_active_file_state(app_handle, &state) {
    eprintln!("⚠️  Failed to persist state: {}", e);
  }

  // Emit to frontend
  if let Err(e) = app_handle.emit("aiMindMap://mindMap/update", &new_mind_map) {
    eprintln!("⚠️  Failed to emit mind map update: {}", e);
  }

  println!("✅ New mind map created: {}", new_mind_map.name);
}