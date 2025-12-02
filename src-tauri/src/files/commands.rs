use super::text_files::load_text_file;
use std::path::Path;

#[tauri::command]
pub fn load_txt_file(filename: String) -> Result<String, String> {
  match load_text_file(Path::new(&filename)) {
    Ok(data) => Ok(data),
    Err(e) => Err(e)
  }
}