'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, UserPlus, Trash2, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';

type User = { id: string; name: string; email: string; role: string; events: number };
type Event = { id: string; title: string; date: string; registered: number; status: string };

export function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [data, setData] = useState<{ users: User[]; events: Event[] }>({ users: [], events: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      const result = await res.json();
      if (res.ok) setData(result);
      else throw new Error(result.message || 'Failed to load data');
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (type: 'user' | 'event', id: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/admin/${type}s/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok) {
        toast({ title: 'Success', description: result.message });
        fetchData();
      } else throw new Error(result.message);
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Operation failed', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge variant={
      status === 'upcoming' ? 'default' : 
      status === 'ongoing' ? 'secondary' : 'outline'
    }>
      {status}
    </Badge>
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push('/admin/users/new')} size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Add User
          </Button>
          <Button onClick={() => router.push('/events/new')} size="sm">
            <Calendar className="h-4 w-4 mr-2" /> Create Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.events.filter(e => e.status === 'upcoming').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="users">Users ({data.users.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({data.events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'outline'}>{user.role}</Badge></TableCell>
                    <TableCell>{user.events}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem('user', user.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>{event.registered}</TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem('event', event.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
