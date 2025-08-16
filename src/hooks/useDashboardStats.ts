import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalFiles: number;
  connections: number;
  teamMembers: number;
  activeProjects: number;
  loading: boolean;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    connections: 1, // Static for now
    teamMembers: 1, // Static for now
    activeProjects: 0,
    loading: true
  });
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching project stats:', error);
        return;
      }

      const projectCount = projects?.length || 0;
      
      setStats({
        totalFiles: projectCount,
        connections: 1, // Static for now
        teamMembers: 1, // Static for now
        activeProjects: projectCount,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Set up real-time subscription for project changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats(); // Refetch stats when projects change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { stats, refetch: fetchStats };
}