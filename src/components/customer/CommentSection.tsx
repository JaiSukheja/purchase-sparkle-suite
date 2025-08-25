import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Clock } from 'lucide-react';

interface Comment {
  id: string;
  comment: string;
  created_at: string;
}

interface CommentSectionProps {
  purchaseId: string;
  productName: string;
}

export const CommentSection = ({ purchaseId, productName }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { customer } = useCustomerAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [purchaseId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_comments')
        .select('*')
        .eq('purchase_id', purchaseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !customer) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('customer_comments')
        .insert([{
          purchase_id: purchaseId,
          customer_id: customer.id,
          comment: newComment.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      setNewComment('');
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments for {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add a comment about this purchase..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Add Comment
              </div>
            )}
          </Button>
        </form>

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-foreground mb-2">{comment.comment}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(comment.created_at).toLocaleDateString()} at{' '}
                  {new Date(comment.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No comments yet. Be the first to add one!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};