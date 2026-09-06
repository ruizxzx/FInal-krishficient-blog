import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, Clock } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface CommentsSectionProps {
  articleSlug: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ articleSlug }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [newComment, setNewComment] = useState('');

  const storageKey = `krishficient_comments_${articleSlug}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load comments', e);
    }
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !newComment.trim()) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      author: name.trim(),
      text: newComment.trim(),
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    setNewComment('');

    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));
    } catch (e) {
      console.warn('Failed to save comment', e);
    }
  };

  return (
    <div className="pt-10 border-t-4 border-black mt-16 space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[var(--color-primary)] neo-border flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <h3 className="font-display font-black text-3xl uppercase tracking-tight text-black">
          DISCUSSION ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-gray-50 neo-border neo-shadow-sm p-6">
        <h4 className="font-mono text-sm font-bold uppercase mb-4 text-black border-b-2 border-black pb-2 inline-block">
          LEAVE A COMMENT
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold text-neutral-600 uppercase mb-1">
              NAME
            </label>
            <div className="flex items-center">
              <div className="bg-neutral-200 border-2 border-black border-r-0 px-3 py-2.5">
                <User className="w-4 h-4 text-black" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fellow Architect"
                className="w-full sm:w-1/2 px-4 py-2.5 bg-white neo-border-2 font-sans font-medium text-black focus:outline-none focus:bg-[var(--color-primary)]/10"
              />
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs font-bold text-neutral-600 uppercase mb-1">
              COMMENT
            </label>
            <textarea
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or architectural insights..."
              rows={4}
              className="w-full px-4 py-3 bg-white neo-border-2 font-sans font-medium text-black focus:outline-none focus:bg-[var(--color-primary)]/10 resize-y"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white font-display font-black text-sm uppercase neo-border neo-shadow-sm hover:bg-[var(--color-success)] hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
          >
            <span>POST COMMENT</span>
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 font-mono text-sm border-2 border-dashed border-neutral-300">
            NO COMMENTS YET. BE THE FIRST TO DISCUSS.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white neo-border p-5">
              <div className="flex items-center justify-between mb-3 border-b-2 border-neutral-100 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-black text-white neo-border-2 flex items-center justify-center font-display font-black text-sm uppercase">
                    {comment.author.charAt(0)}
                  </div>
                  <span className="font-display font-black text-sm uppercase text-black">
                    {comment.author}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-neutral-500 font-mono text-[10px] font-bold uppercase">
                  <Clock className="w-3 h-3" />
                  <span>{comment.timestamp}</span>
                </div>
              </div>
              <p className="font-serif text-base text-neutral-800 leading-relaxed whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
