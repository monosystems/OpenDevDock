import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { StartView } from "./views/StartView";
import { WorkspaceView } from "./views/WorkspaceView";
import { AppState, Project } from "./state/types";

function App() {
  const [appState, setAppState] = useState<AppState>({
    view: "start",
    projects: [],
    activeProject: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem("opendevdock_projects");
    if (saved) {
      try {
        const projects = JSON.parse(saved);
        setAppState((prev) => ({ ...prev, projects }));
      } catch (e) {
        console.error("Failed to load saved projects:", e);
      }
    }
  }, []);

  const saveProjects = useCallback((projects: Project[]) => {
    localStorage.setItem("opendevdock_projects", JSON.stringify(projects));
  }, []);

  const handleAddProject = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Folder",
      });

      if (selected && typeof selected === "string") {
        const name = await invoke<string>("get_project_name", {
          path: selected,
        });

        const newProject: Project = {
          name,
          path: selected,
        };

        setAppState((prev) => {
          const exists = prev.projects.some((p) => p.path === selected);
          if (exists) {
            return prev;
          }
          const newProjects = [...prev.projects, newProject];
          saveProjects(newProjects);
          return { ...prev, projects: newProjects };
        });
      }
    } catch (e) {
      console.error("Failed to add project:", e);
    }
  }, [saveProjects]);

  const handleOpenProject = useCallback((project: Project) => {
    setAppState((prev) => ({
      ...prev,
      view: "workspace",
      activeProject: project,
    }));
  }, []);

  const handleRemoveProject = useCallback(
    (projectPath: string) => {
      setAppState((prev) => {
        const newProjects = prev.projects.filter((p) => p.path !== projectPath);
        saveProjects(newProjects);
        return { ...prev, projects: newProjects };
      });
    },
    [saveProjects]
  );

  const handleCloseWorkspace = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      view: "start",
      activeProject: null,
    }));
  }, []);

  if (appState.view === "workspace" && appState.activeProject) {
    return (
      <WorkspaceView
        project={appState.activeProject}
        onClose={handleCloseWorkspace}
      />
    );
  }

  return (
    <StartView
      projects={appState.projects}
      onAddProject={handleAddProject}
      onOpenProject={handleOpenProject}
      onRemoveProject={handleRemoveProject}
    />
  );
}

export default App;
