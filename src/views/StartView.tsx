import { Project, Session } from "../state/types";
import { SessionHistoryList } from "../components/SessionHistoryList";
import { ChevronRightIcon, ClockIcon, FolderIcon, PlusIcon, SparkIcon } from "../components/ui/Icons";

function formatLastActivity(sessions: Session[]): string {
  if (sessions.length === 0) {
    return "No recent activity";
  }

  const latest = Math.max(...sessions.map((session) => session.createdAt));
  const diffMs = Date.now() - latest;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Active just now";
  }

  if (diffMins < 60) {
    return `Active ${diffMins} min ago`;
  }

  if (diffHours < 24) {
    return `Active ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  if (diffDays < 7) {
    return `Active ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  return `Active ${new Date(latest).toLocaleDateString()}`;
}

interface StartViewProps {
  projects: Project[];
  onAddProject: () => void;
  onOpenProject: (project: Project) => void;
  onRemoveProject: (projectPath: string) => void;
  sessionsByProject: Record<string, Session[]>;
  onOpenSession: (session: Session) => void;
  onDeleteSession: (sessionId: string, projectPath: string) => void;
  onUpdateSessionName: (sessionId: string, projectPath: string, newName: string) => void;
}

export function StartView({
  projects,
  onAddProject,
  onOpenProject,
  onRemoveProject,
  sessionsByProject,
  onOpenSession,
  onDeleteSession,
  onUpdateSessionName,
}: StartViewProps) {
  return (
    <div className="start-view">
      <div className="start-view-shell">
        <div className="start-view-header">
          <div className="start-view-header-copy">
            <span className="start-view-eyebrow">
              <SparkIcon size={14} />
              Workspace catalog
            </span>
            <div className="start-view-title-row">
              <h1>OpenDevDock</h1>
              <button className="btn-primary start-view-add" onClick={onAddProject}>
                <PlusIcon size={16} />
                Add Project
              </button>
            </div>
            <p className="start-view-subtitle">
              Open local projects, resume recent sessions, and keep your active workspaces in one place.
            </p>
            <div className="start-view-summary">
              <span className="start-view-summary-pill">{projects.length} workspaces</span>
              <span className="start-view-summary-pill">Session-first resume flow</span>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-art">
              <FolderIcon size={28} />
            </div>
            <p>No projects added yet</p>
            <p>Add a local folder to create your first workspace.</p>
          </div>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.path} className="project-entry">
                {(() => {
                  const sessions = sessionsByProject[project.path] || [];
                  const latestSession = sessions
                    .slice()
                    .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;

                  return (
                    <>
                      <div
                        className="project-item"
                        onClick={() => onOpenProject(project)}
                      >
                        <div className="project-item-leading">
                          <span className="project-item-icon" aria-hidden="true">
                            <FolderIcon size={18} />
                          </span>
                          <div className="project-item-info">
                            <div className="project-item-topline">
                              <span className="project-item-name">{project.name}</span>
                              <span className="project-item-badge">
                                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <span className="project-item-path">{project.path}</span>
                            <div className="project-item-meta-row">
                              <span className="project-item-meta">
                                <ClockIcon size={12} />
                                {formatLastActivity(sessions)}
                              </span>
                              {latestSession && (
                                <span className="project-item-meta project-item-meta-emphasis">
                                  Last session: {latestSession.name}
                                </span>
                              )}
                            </div>
                          </div>
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
                          <span className="project-item-open" aria-hidden="true">
                            <ChevronRightIcon size={16} />
                          </span>
                        </div>
                      </div>
                      {sessions.length > 0 && (
                        <SessionHistoryList
                          projectPath={project.path}
                          sessions={sessions}
                          onOpenSession={onOpenSession}
                          onDeleteSession={onDeleteSession}
                          onUpdateSessionName={onUpdateSessionName}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
