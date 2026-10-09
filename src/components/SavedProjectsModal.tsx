import React, { useEffect, useState } from 'react';
import { X, Trash2, FolderOpen, AlertTriangle, Clock } from 'lucide-react';
import { getProjects, deleteProject, clearAllProjects } from '../storage/db';
import type { Project } from '../editor/types';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  currentProjectId?: string;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  currentProjectId,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getProjects().then((list) => {
      if (!isMounted) return;
      setProjects(list);

      // Create object URLs for thumbnails
      const urls: Record<string, string> = {};
      list.forEach((p) => {
        if (p.thumbBlob) {
          urls[p.id] = URL.createObjectURL(p.thumbBlob);
        } else if (p.imageBlob) {
          urls[p.id] = URL.createObjectURL(p.imageBlob);
        }
      });
      setThumbUrls(urls);
    });

    return () => {
      isMounted = false;
      Object.values(thumbUrls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all saved projects from your device? This cannot be undone.')) {
      setIsClearing(true);
      await clearAllProjects();
      setProjects([]);
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">Saved Projects</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 min-h-[160px]">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 text-center">
              <FolderOpen className="w-12 h-12 stroke-[1.5] text-slate-600" />
              <p className="text-sm font-medium">No saved projects yet</p>
              <p className="text-xs text-slate-400">
                Uploaded photos and blackout masks are saved automatically on this device.
              </p>
            </div>
          ) : (
            projects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              const dateStr = new Date(p.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className={`group flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/50'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {thumbUrls[p.id] ? (
                      <img
                        src={thumbUrls[p.id]}
                        alt="Project thumb"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200 truncate">
                      {p.caption || 'Celebrity Reveal Project'}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {dateStr}
                      </span>
                      <span>•</span>
                      <span>{p.strokes.length} mask strokes</span>
                      {isCurrent && (
                        <span className="text-indigo-400 font-semibold">(Current)</span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, p.id)}
                    title="Delete project"
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Clear All */}
        {projects.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Delete all my local data
            </button>
            <span className="text-[11px] text-slate-400">
              {projects.length} / 20 stored locally
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
