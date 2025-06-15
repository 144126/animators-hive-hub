
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const CommunitiesPage = () => {
  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('name, display_name, description, avatar_url, member_count');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-theme(space.14))]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">Communities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities?.map(community => (
          <Link to={`/c/${community.name}`} key={community.name} className="block">
            <Card className="p-4 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center space-x-4 mb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={community.avatar_url || undefined} />
                  <AvatarFallback>{community.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{community.display_name}</h2>
                  <p className="text-sm text-muted-foreground">{community.member_count || 0} members</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CommunitiesPage;
