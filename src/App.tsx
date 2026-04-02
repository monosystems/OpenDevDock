import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { StartView } from "./views/StartView";
import { WorkspaceView } from "./views/WorkspaceView";
import { AppState, Project, Session } from "./state/types";
import { useSession } from "./hooks/useSession";

function App() {
  const [appState, setAppState] = useState<AppState>({
    view: "start",
    projects: [],
    activeProject: null,
  });

  const [sessionFromHistory, setSessionFromHistory] = useState<Session | null>(null);

  const {
    activeSession,
    sessionsByProject,
    createSession,
    clearSession,
    setActiveSessionFromHistory,
    trackFileCreated,
    trackFileEdited,
    trackFileDeleted,
    trackDirectoryDeleted,
    getChangedFilePaths,
    hasChanges,
    loadSessionsForProject,
    deleteSession,
    updateSessionName,
  } = useSession();

  useEffect(() => {
    const saved = localStorage.getItem("opendevdock_projects");
    if (saved) {
      try {
        const projects = JSON.parse(saved);
        setAppState((prev) => ({ ...prev, projects }));
        projects.forEach((project: Project) => {
          loadSessionsForProject(project.path);
        });
      } catch (e) {
        console.error("Failed to load saved projects:", e);
      }
    }
  }, [loadSessionsForProject]);

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
    setSessionFromHistory(null);
    createSession(project);
    setAppState((prev) => ({
      ...prev,
      view: "workspace",
      activeProject: project,
    }));
  }, [createSession]);

  const handleOpenSession = useCallback((session: Session) => {
    const project: Project = {
      name: session.projectName,
      path: session.projectPath,
    };
    setSessionFromHistory(session);
    setActiveSessionFromHistory(session);
    setAppState((prev) => ({
      ...prev,
      view: "workspace",
      activeProject: project,
    }));
  }, [setActiveSessionFromHistory]);

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
    clearSession();
    setSessionFromHistory(null);
    setAppState((prev) => ({
      ...prev,
      view: "start",
      activeProject: null,
    }));
  }, [clearSession]);

  if (appState.view === "workspace" && appState.activeProject) {
    return (
      <WorkspaceView
        project={appState.activeProject}
        onClose={handleCloseWorkspace}
        session={activeSession}
        trackFileCreated={trackFileCreated}
        trackFileEdited={trackFileEdited}
        trackFileDeleted={trackFileDeleted}
        trackDirectoryDeleted={trackDirectoryDeleted}
        changedFilePaths={getChangedFilePaths()}
        hasChanges={hasChanges ?? false}
        openInChangesView={sessionFromHistory !== null}
      />
    );
  }

  return (
    <StartView
      projects={appState.projects}
      onAddProject={handleAddProject}
      onOpenProject={handleOpenProject}
      onRemoveProject={handleRemoveProject}
      sessionsByProject={sessionsByProject}
      onOpenSession={handleOpenSession}
      onDeleteSession={deleteSession}
      onUpdateSessionName={updateSessionName}
    />
  );
}

export default App;