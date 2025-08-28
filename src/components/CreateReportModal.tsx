
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: () => void;
}

const categories = [
  'Traffic',
  'Road Damage',
  'Water Drainage',
  'Tree Fallen',
  'Street Light Issue',
  'Garbage',
  'Construction',
  'Public Property Damage',
  'Others'
];

export const CreateReportModal = ({ isOpen, onClose, onReportCreated }: CreateReportModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('report-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          location,
          category: category as any,
          image_url: imageUrl,
          user_id: user.id,
        });

      if (error) throw error;

      toast({ title: "Report created successfully!" });
      onReportCreated();
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('');
      setImage(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Brief description of the issue"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Detailed description of the civic issue"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Street address or landmark"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="image">Image (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
            {image && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {image.name}
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Report...' : 'Create Report'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
