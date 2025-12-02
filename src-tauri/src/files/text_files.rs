use std::path::Path;

/// Load a text file from the given path and return its contents as a string.
/// This is a generic utility function that can be used to load any text file.
pub fn load_text_file(file_path: &Path) -> Result<String, String> {
  if !file_path.exists() {
    return Err(format!("File not found: {:?}", file_path));
  }

  let file_string = std::fs::read_to_string(file_path)
    .map_err(|e| format!("Failed to read file: {}", e))?;

  Ok(file_string)
}