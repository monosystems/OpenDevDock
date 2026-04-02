import { invoke } from "@tauri-apps/api/core";
import { FileNode } from "../state/types";

export async function createFile(
  parentPath: string,
  name: string
): Promise<FileNode> {
  return invoke<FileNode>("create_file", {
    parentPath,
    name,
  });
}

export async function createDirectory(
  parentPath: string,
  name: string
): Promise<FileNode> {
  return invoke<FileNode>("create_directory", {
    parentPath,
    name,
  });
}

export async function renamePath(
  oldPath: string,
  newName: string
): Promise<FileNode> {
  return invoke<FileNode>("rename_path", {
    oldPath,
    newName,
  });
}

export async function deletePath(path: string): Promise<void> {
  return invoke<void>("delete_path", { path });
}

export async function movePath(
  sourcePath: string,
  destDir: string
): Promise<FileNode> {
  return invoke<FileNode>("move_path", {
    sourcePath,
    destDir,
  });
}

export async function readFileContent(path: string): Promise<string> {
  return invoke<string>("read_file_content", { path });
}
