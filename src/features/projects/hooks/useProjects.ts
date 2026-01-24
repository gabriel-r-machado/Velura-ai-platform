import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import type { Json } from '@/shared/lib/supabase/types';

export interface ProjectMessage {
  id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Project {
  id: string;
  prompt: string;
  code_content: Record<string, string>;
  created_at: string;
  updated_at: string;
  messages?: ProjectMessage[];
}

interface RawProject {
  id: string;
  prompt: string;
  code_content: Json;
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generated_sites')
        .select('id, prompt, code_content, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to ensure code_content is properly typed
      const transformedData: Project[] = (data as RawProject[]).map((item) => ({
        id: item.id,
        prompt: item.prompt,
        code_content: item.code_content as Record<string, string>,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setProjects(transformedData);
      setError(null);
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchProjectMessages = async (projectId: string): Promise<ProjectMessage[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((msg) => ({
        id: msg.id,
        project_id: msg.project_id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        created_at: msg.created_at,
      }));
    } catch (err) {

      return [];
    }
  };

  const saveMessage = async (projectId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          role,
          content,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (err) {

      return null;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('generated_sites')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {

      throw err;
    }
  };

  const updateProjectCode = async (projectId: string, codeContent: Record<string, string>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('generated_sites')
        .update({ code_content: codeContent })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, code_content: codeContent } : p
        )
      );
    } catch (err) {

      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    deleteProject,
    fetchProjectMessages,
    saveMessage,
    updateProjectCode,
  };
}
