#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::menu::{Menu, MenuBuilder, MenuEvent, MenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;

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

  let default_menu = SubmenuBuilder::new(app, "default")
    .text("settings", "Settings")
    .separator()
    .text("quit", "Quit AI Mind Map")
    .build()?;
  
  let window_menu = SubmenuBuilder::new(app, "Window")
    .text("new", "New")
    .text("open", "Open")
    .text("save", "Save")
    .build()?;


  let menu = MenuBuilder::new(handle)
    .items(&[&default_menu, &window_menu])
    .build()?;

  app.set_menu(menu)?;
  
  Ok(())
}