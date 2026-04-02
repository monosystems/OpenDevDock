export interface Project {
  name: string;
  path: string;
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileNode[];
}

export type View = "start" | "workspace";

export interface AppState {
  view: View;
  projects: Project[];
  activeProject: Project | null;
}

export interface Tab {
  id: string;
  type: "terminal" | "file";
  title: string;
  path?: string;
}

export interface TerminalTab extends Tab {
  type: "terminal";
  terminalId: string;
  workingDirectory: string;
}

export interface FileTab extends Tab {
  type: "file";
  content: string;
}

export type ChangeType = "created" | "edited" | "deleted";

export interface ChangedFile {
  path: string;
  name: string;
  changeType: ChangeType;
  originalContent: string | null;
  currentContent: string | null;
  timestamp: number;
}

export interface Session {
  id: string;
  projectPath: string;
  projectName: string;
  createdAt: number;
  name: string;
  changedFiles: ChangedFile[];
}

