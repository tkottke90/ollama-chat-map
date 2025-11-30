#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::app_menu::events::{on_debug_viewport, on_new, on_open, on_settings};
use crate::ollama::{OllamaConfig, OllamaStatus};
use tauri::menu::{Menu, MenuBuilder, MenuItem, PredefinedMenuItem, SubmenuBuilder, CheckMenuItemBuilder};
use tauri::tray::TrayIconBuilder;

mod events;

/// Menu item IDs for tray
pub const TRAY_MENU_ID: &str = "main";
pub const TRAY_OLLAMA_SERVER_ID: &str = "ollama-server";
pub const TRAY_OLLAMA_STATUS_ID: &str = "ollama-status";

pub fn configure<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
  configure_tray(app)?;
  configure_menus(app)?;

  Ok(())
}

fn configure_tray<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
  let ollama_server = MenuItem::with_id(app, TRAY_OLLAMA_SERVER_ID, "Server: http://localhost:11434", false, None::<&str>)?;
  let ollama_status = MenuItem::with_id(app, TRAY_OLLAMA_STATUS_ID, "Status: Checking...", false, None::<&str>)?;
  let menu = Menu::with_id_and_items(app, TRAY_MENU_ID, &[&ollama_server, &ollama_status])?;

  TrayIconBuilder::with_id(TRAY_MENU_ID)
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&menu)
    .show_menu_on_left_click(true)
    .build(app)?;

  Ok(())
}

/// Update tray menu by rebuilding it with current config and status
pub fn update_tray_ollama_info<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  config: &OllamaConfig,
  status: &OllamaStatus,
) {
  use tauri::tray::TrayIconId;

  // Get the tray by ID
  if let Some(tray) = app.tray_by_id(&TrayIconId::new(TRAY_MENU_ID)) {
    // Build the updated menu text
    let server_text = format!("Server: {}:{}", config.domain, config.port);
    let status_text = if status.is_available {
      format!("Status: Available ({} models)", status.models.len())
    } else {
      "Status: Unavailable".to_string()
    };

    // Create new menu items with updated text
    let server_item = match MenuItem::with_id(app, TRAY_OLLAMA_SERVER_ID, &server_text, false, None::<&str>) {
      Ok(item) => item,
      Err(e) => {
        eprintln!("⚠️  Failed to create server menu item: {}", e);
        return;
      }
    };

    let status_item = match MenuItem::with_id(app, TRAY_OLLAMA_STATUS_ID, &status_text, false, None::<&str>) {
      Ok(item) => item,
      Err(e) => {
        eprintln!("⚠️  Failed to create status menu item: {}", e);
        return;
      }
    };

    // Create new menu with updated items
    let menu = match Menu::with_items(app, &[&server_item, &status_item]) {
      Ok(m) => m,
      Err(e) => {
        eprintln!("⚠️  Failed to create tray menu: {}", e);
        return;
      }
    };

    // Set the new menu on the tray
    if let Err(e) = tray.set_menu(Some(menu)) {
      eprintln!("⚠️  Failed to set tray menu: {}", e);
    }
  }
}

fn configure_menus<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
  let handle = app.handle();

  let new_item = MenuItem::with_id(app, "new", "New", true, Some("CmdOrCtrl+N"))?;
  let open_item = MenuItem::with_id(app, "open", "Open", true, Some("CmdOrCtrl+O"))?;

  let default_menu = SubmenuBuilder::new(app, "default")
    .item(&new_item)
    .item(&open_item)
    .separator()
    .text("settings", "Settings")
    .separator()
    .item(&PredefinedMenuItem::quit(app, Some("Quit AI Mind Map"))?)
    .build()?;
  
  let show_debug_viewport = CheckMenuItemBuilder::with_id("debugViewport", "Show Viewport Position")
    .checked(false)
    .build(app)?;

  let window_menu = SubmenuBuilder::new(app, "Window")
    .item(&show_debug_viewport)
    .separator()
    .item(&PredefinedMenuItem::fullscreen(app, Some("Fullscreen"))?)
    .build()?;


  let menu = MenuBuilder::new(handle)
    .items(&[&default_menu, &window_menu])
    .build()?;

  app.set_menu(menu)?;

  app.on_menu_event(move |app_handle, event| {
    match event.id().0.as_str() {
      "debugViewport" => {
        on_debug_viewport(app_handle, window_menu.clone());
      }
      "new" => {
        on_new(app_handle);
      }
      "open" => {
        on_open(app_handle);
      }
      "settings" => {
        on_settings(app_handle);
      }
      _ => {} // Do nothing when there is no match
    }
  });
  
  Ok(())
}