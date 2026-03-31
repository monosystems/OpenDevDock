import { Project } from "../state/types";

interface StartViewProps {
  projects: Project[];
  onAddProject: () => void;
  onOpenProject: (project: Project) => void;
  onRemoveProject: (projectPath: string) => void;
}

export function StartView({
  projects,
  onAddProject,
  onOpenProject,
  onRemoveProject,
}: StartViewProps) {
  return (
    <div className="start-view">
      <h1>OpenDevDock</h1>
      <p>Select a project to open your workspace</p>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects added yet.</p>
          <p>Add a local folder to get started.</p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <div
              key={project.path}
              className="project-item"
              onClick={() => onOpenProject(project)}
            >
              <div className="project-item-info">
                <span className="project-item-name">{project.name}</span>
                <span className="project-item-path">{project.path}</span>
              </div>
              <div className="project-item-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProject(project.path);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={onAddProject}>
        Add Project Folder
      </button>
    </div>
  );
}
