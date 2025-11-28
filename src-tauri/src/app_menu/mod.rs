#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::app_menu::events::{on_debug_viewport, on_new, on_open, on_settings};
use tauri::menu::{Menu, MenuBuilder, MenuItem, SubmenuBuilder, CheckMenuItemBuilder};
use tauri::tray::TrayIconBuilder;

mod events;

pub fn configure<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {  
  configure_tray(app)?;
  configure_menus(app)?;

  Ok(())
}

fn configure_tray<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
  let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&quit_i])?;

  TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&menu)
    .show_menu_on_left_click(true)
    .build(app)?;

  Ok(())
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
    .text("quit", "Quit AI Mind Map")
    .build()?;
  
  let show_debug_viewport = CheckMenuItemBuilder::with_id("debugViewport", "Show Viewport Position")
    .checked(false)
    .build(app)?;

  let window_menu = SubmenuBuilder::new(app, "Window")
    .item(&show_debug_viewport)
    .separator()
    .text("fullScreen", "Fullscreen")
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