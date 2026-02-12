import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProjects, Project } from '@/hooks/useProjects';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProjectId: (id: string) => void;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { projects, isLoading } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedId) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const selectedProject = projects.find(p => p.id === selectedId) ?? null;

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProjectId: setSelectedId, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
};
