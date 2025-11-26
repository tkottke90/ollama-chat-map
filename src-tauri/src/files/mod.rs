use tauri::Manager;

pub fn build_config_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<std::path::PathBuf, String> {
  app.path().app_data_dir()
    .map_err(|e| format!("Failed to get app data directory: {}", e))
}

pub fn build_data_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> Result<std::path::PathBuf, String> {
  let doc_dir = app.path().document_dir()
    .map_err(|e| format!("Failed to get document directory: {}", e))?;

  Ok(doc_dir.join("AiMindMap"))
}