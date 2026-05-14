use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
