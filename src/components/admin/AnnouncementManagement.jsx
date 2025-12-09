import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Megaphone, Trash } from 'lucide-react';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    message: '',
    sendEmail: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) {
        throw new Error('Failed to load announcements');
      }
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Fetch announcements error:', error);
      toast.error('Could not load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create announcement');
      }

      toast.success('Announcement created');
      setForm({ title: '', message: '', sendEmail: true });
      fetchAnnouncements();
    } catch (error) {
      console.error('Create announcement error:', error);
      toast.error(error.message || 'Failed to create announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete announcement');
      }
      toast.success('Announcement deleted');
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error('Delete announcement error:', error);
      toast.error(error.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Announcements
            </CardTitle>
            <CardDescription>Send announcements to students and parents.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Announcement title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write the announcement message..."
                rows={5}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-gray-900">Email students and parents</p>
                <p className="text-sm text-gray-600">Send this announcement as an email.</p>
              </div>
              <Switch
                checked={form.sendEmail}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, sendEmail: value }))}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Publish Announcement'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Latest 50 announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-gray-600">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <p className="text-gray-700 whitespace-pre-line mt-1">{announcement.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {announcement.sendEmail && (
                        <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          Emailed ({announcement.emailCount || 0})
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(announcement._id)}
                        disabled={deletingId === announcement._id}
                      >
                        {deletingId === announcement._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

