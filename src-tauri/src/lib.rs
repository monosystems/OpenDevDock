use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileNode>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TerminalOutput {
    pub id: String,
    pub data: String,
}

pub struct PtyManager {
    terminals: Mutex<HashMap<String, PtyPair>>,
    writers: Mutex<HashMap<String, Box<dyn Write + Send>>>,
}

impl PtyManager {
    pub fn new() -> Self {
        PtyManager {
            terminals: Mutex::new(HashMap::new()),
            writers: Mutex::new(HashMap::new()),
        }
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileNode>, String> {
    let path = PathBuf::from(&path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path.display()));
    }

    read_dir_recursive(&path)
}

fn read_dir_recursive(path: &PathBuf) -> Result<Vec<FileNode>, String> {
    let mut entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {}", e))?
        .filter_map(|entry| entry.ok())
        .collect::<Vec<_>>();

    entries.sort_by(|a, b| {
        let a_is_dir = a.path().is_dir();
        let b_is_dir = b.path().is_dir();
        match (a_is_dir, b_is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.file_name().cmp(&b.file_name()),
        }
    });

    let mut result = Vec::new();

    for entry in entries {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        if name.starts_with('.') {
            continue;
        }

        let is_dir = entry_path.is_dir();
        let children = if is_dir {
            Some(read_dir_recursive(&entry_path)?)
        } else {
            None
        };

        result.push(FileNode {
            name,
            path: entry_path.to_string_lossy().to_string(),
            is_dir,
            children,
        });
    }

    Ok(result)
}

#[tauri::command]
fn get_project_name(path: String) -> String {
    let path = PathBuf::from(&path);
    path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "Unknown".to_string())
}

#[tauri::command]
fn path_exists(path: String) -> bool {
    PathBuf::from(&path).exists()
}

#[tauri::command]
fn create_terminal(
    id: String,
    working_dir: String,
    manager: State<PtyManager>,
    app: AppHandle,
) -> Result<(), String> {
    log::info!("Creating terminal: id={}, cwd={}", id, working_dir);

    let pty_system = native_pty_system();

    // Create shell command based on platform
    #[cfg(target_os = "macos")]
    let mut cmd = CommandBuilder::new("/bin/zsh");

    #[cfg(not(target_os = "macos"))]
    let mut cmd = CommandBuilder::new("/bin/bash");

    // Set environment
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");

    // Set working directory
    let cwd = if !working_dir.is_empty() {
        let wd = PathBuf::from(&working_dir);
        if wd.exists() {
            Some(wd)
        } else {
            None
        }
    } else {
        None
    };

    // Create PTY pair with initial size
    let pty_pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open PTY: {}", e))?;

    // Set working directory if valid
    if let Some(ref path) = cwd {
        cmd.cwd(path);
    }

    // Spawn the shell
    let child = pty_pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to spawn shell: {}", e))?;

    log::info!("Shell spawned with pid: {:?}", child.process_id());

    // IMPORTANT: Store pty_pair FIRST to keep slave PTY open
    // The child process stays alive as long as the slave end of the PTY is open
    // We must not drop pty_pair until the terminal is closed
    manager
        .terminals
        .lock()
        .unwrap()
        .insert(id.clone(), pty_pair);

    // Take writer and reader AFTER storing pty_pair
    let writer = manager
        .terminals
        .lock()
        .unwrap()
        .get(&id)
        .unwrap()
        .master
        .take_writer()
        .map_err(|e| format!("Failed to get writer: {}", e))?;

    let reader = manager
        .terminals
        .lock()
        .unwrap()
        .get(&id)
        .unwrap()
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to get reader: {}", e))?;

    manager.writers.lock().unwrap().insert(id.clone(), writer);

    let id_clone = id.clone();
    let app_clone = app.clone();

    // Spawn reader thread
    std::thread::spawn(move || {
        let mut reader = reader;
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => {
                    break;
                }
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit(
                        "terminal-output",
                        TerminalOutput {
                            id: id_clone.clone(),
                            data,
                        },
                    );
                }
                Err(e) => {
                    log::error!("Read error: {}", e);
                    break;
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn write_terminal(id: String, data: String, manager: State<PtyManager>) -> Result<(), String> {
    let mut writers = manager.writers.lock().unwrap();
    if let Some(writer) = writers.get_mut(&id) {
        writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Write error: {}", e))?;
        writer.flush().map_err(|e| format!("Flush error: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn resize_terminal(
    id: String,
    cols: u16,
    rows: u16,
    manager: State<PtyManager>,
) -> Result<(), String> {
    let terminals = manager.terminals.lock().unwrap();
    if let Some(pty) = terminals.get(&id) {
        pty.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Resize error: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn close_terminal(id: String, manager: State<PtyManager>) -> Result<(), String> {
    log::info!("Closing terminal: {}", id);
    // Remove from both maps - dropping pty_pair will close the PTY
    manager.terminals.lock().unwrap().remove(&id);
    manager.writers.lock().unwrap().remove(&id);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    log::info!("Starting OpenDevDock application");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(PtyManager::new())
        .invoke_handler(tauri::generate_handler![
            read_directory,
            get_project_name,
            path_exists,
            create_terminal,
            write_terminal,
            resize_terminal,
            close_terminal
        ])
        .setup(|app| {
            log::info!("Application setup complete");
            let _window = app.get_webview_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
