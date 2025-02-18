// app/context/ProjectContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Project } from 'server/models';

type ProjectContextType = {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

const STORAGE_KEY = 'selectedProject';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load the selected project from localStorage on mount
  useEffect(() => {
    const storedProject = localStorage.getItem(STORAGE_KEY);
    if (storedProject) {
      try {
        setSelectedProjectState(JSON.parse(storedProject));
      } catch (error) {
        console.error('Error parsing stored project:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Wrapper function to update both state and localStorage
  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject, isLoading, setIsLoading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}