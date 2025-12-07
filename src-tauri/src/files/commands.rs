use super::text_files::load_text_file;
use mime_guess::from_path;
use serde::Serialize;
use std::path::Path;

#[derive(Serialize)]
pub struct FileResponse {
  pub content: String,
  pub mime_type: String,
}

#[tauri::command]
pub fn load_txt_file(filename: String) -> Result<FileResponse, String> {
  let content = load_text_file(Path::new(&filename))?;
  let mime_type = from_path(&filename)
    .first_or_text_plain()
    .to_string();

  Ok(FileResponse { content, mime_type })
}