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
fn read_file_content(path: String) -> Result<String, String> {
    if path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }

    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    if path_buf.is_dir() {
        return Err(format!("Path is a directory, not a file: {}", path));
    }

    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn create_file(parent_path: String, name: String) -> Result<FileNode, String> {
    log::info!("create_file called: parent={}, name={}", parent_path, name);
    let invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    if name.is_empty() || name.chars().any(|c| invalid_chars.contains(&c)) {
        return Err("Invalid file name".to_string());
    }

    let file_path = PathBuf::from(&parent_path).join(&name);
    if file_path.exists() {
        return Err(format!("File already exists: {}", name));
    }

    std::fs::write(&file_path, "").map_err(|e| format!("Failed to create file: {}", e))?;

    log::info!("create_file success: {:?}", file_path);

    Ok(FileNode {
        name,
        path: file_path.to_string_lossy().to_string(),
        is_dir: false,
        children: None,
    })
}

#[tauri::command]
fn create_directory(parent_path: String, name: String) -> Result<FileNode, String> {
    let invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    if name.is_empty() || name.chars().any(|c| invalid_chars.contains(&c)) {
        return Err("Invalid folder name".to_string());
    }

    let dir_path = PathBuf::from(&parent_path).join(&name);
    if dir_path.exists() {
        return Err(format!("Folder already exists: {}", name));
    }

    std::fs::create_dir(&dir_path).map_err(|e| format!("Failed to create folder: {}", e))?;

    Ok(FileNode {
        name,
        path: dir_path.to_string_lossy().to_string(),
        is_dir: true,
        children: Some(Vec::new()),
    })
}

#[tauri::command]
fn rename_path(old_path: String, new_name: String) -> Result<FileNode, String> {
    let invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    if new_name.is_empty() || new_name.chars().any(|c| invalid_chars.contains(&c)) {
        return Err("Invalid name".to_string());
    }

    let old = PathBuf::from(&old_path);
    if !old.exists() {
        return Err(format!("Path does not exist: {}", old_path));
    }

    let parent = old
        .parent()
        .ok_or_else(|| "Cannot get parent directory".to_string())?;
    let new_path = parent.join(&new_name);

    if new_path.exists() {
        return Err(format!(
            "A file with this name already exists: {}",
            new_name
        ));
    }

    std::fs::rename(&old, &new_path).map_err(|e| format!("Failed to rename: {}", e))?;

    let is_dir = new_path.is_dir();
    Ok(FileNode {
        name: new_name,
        path: new_path.to_string_lossy().to_string(),
        is_dir,
        children: if is_dir { Some(Vec::new()) } else { None },
    })
}

#[tauri::command]
fn delete_path(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    if p.is_dir() {
        std::fs::remove_dir_all(&p).map_err(|e| format!("Failed to delete folder: {}", e))?;
    } else {
        std::fs::remove_file(&p).map_err(|e| format!("Failed to delete file: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn move_path(source_path: String, dest_dir: String) -> Result<FileNode, String> {
    let source = PathBuf::from(&source_path);
    let dest_parent = PathBuf::from(&dest_dir);

    if !source.exists() {
        return Err(format!("Source does not exist: {}", source_path));
    }

    if !dest_parent.is_dir() {
        return Err(format!("Destination is not a directory: {}", dest_dir));
    }

    let file_name = source
        .file_name()
        .ok_or_else(|| "Cannot get file name".to_string())?;
    let new_path = dest_parent.join(file_name);

    if new_path.exists() {
        return Err(format!(
            "A file with this name already exists in destination: {}",
            file_name.to_string_lossy()
        ));
    }

    if source.is_dir() {
        std::fs::rename(&source, &new_path).map_err(|e| format!("Failed to move folder: {}", e))?;
    } else {
        std::fs::rename(&source, &new_path).map_err(|e| format!("Failed to move file: {}", e))?;
    }

    let is_dir = new_path.is_dir();
    Ok(FileNode {
        name: file_name.to_string_lossy().to_string(),
        path: new_path.to_string_lossy().to_string(),
        is_dir,
        children: if is_dir { Some(Vec::new()) } else { None },
    })
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

    log::info!("Writer and reader obtained successfully");

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
    log::info!("write_terminal called: id={}, data_len={}", id, data.len());
    let mut writers = manager.writers.lock().unwrap();
    if let Some(writer) = writers.get_mut(&id) {
        writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Write error: {}", e))?;
        writer.flush().map_err(|e| format!("Flush error: {}", e))?;
    } else {
        log::error!("write_terminal: writer not found for id={}", id);
        return Err(format!("Writer not found for terminal: {}", id));
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

#[tauri::command]
fn get_git_branch(path: String) -> Result<String, String> {
    let output = std::process::Command::new("git")
        .args(["-C", &path, "rev-parse", "--abbrev-ref", "HEAD"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err("Not a git repository".to_string())
    }
}

#[tauri::command]
fn is_git_repository(path: String) -> bool {
    PathBuf::from(&path).join(".git").exists()
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
            read_file_content,
            create_file,
            create_directory,
            rename_path,
            delete_path,
            move_path,
            create_terminal,
            write_terminal,
            resize_terminal,
            close_terminal,
            get_git_branch,
            is_git_repository
        ])
        .setup(|app| {
            log::info!("Application setup complete");
            let _window = app.get_webview_window("main").unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
