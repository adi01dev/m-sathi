
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { communityAPI } from '@/lib/api';
import { CommunityGroup } from '@/lib/types';
import { Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function CommunityGroups() {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await communityAPI.getGroups();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching community groups:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load community groups.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [toast]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      await communityAPI.joinGroup('user-1', groupId);
      setJoinedGroups(prev => [...prev, groupId]);
      
      toast({
        title: "Group joined",
        description: "You've successfully joined this support group.",
      });
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Couldn't join group. Please try again.",
      });
    }
  };

  const isJoined = (groupId: string): boolean => {
    return joinedGroups.includes(groupId);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading communities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {groups.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={group.imageUrl} />
                  <AvatarFallback>{group.name[0]}</AvatarFallback>
                </Avatar>
                {group.name}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {group.category}
                </Badge>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                size="sm"
                variant="outline"
                className="flex gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                View Discussions
              </Button>
              
              <Button
                size="sm"
                variant={isJoined(group.id) ? "outline" : "default"}
                onClick={() => !isJoined(group.id) && handleJoinGroup(group.id)}
                disabled={isJoined(group.id)}
              >
                {isJoined(group.id) ? "Joined" : "Join Group"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
