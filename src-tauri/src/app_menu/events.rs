use tauri::menu::Submenu;
use tauri::Emitter;

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
