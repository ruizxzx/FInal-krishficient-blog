import React from 'react';
import { ArticleContentBlock } from '../types';
import { PlusCircle, Trash2, Upload, GripVertical } from 'lucide-react';

interface ContentBlockEditorProps {
  blocks: ArticleContentBlock[];
  onChange: (blocks: ArticleContentBlock[]) => void;
  onUploadImage: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({ blocks, onChange, onUploadImage }) => {
  const addBlock = (type: ArticleContentBlock['type']) => {
    onChange([...blocks, { type, content: '' }]);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    onChange(newBlocks);
  };

  const updateBlock = (index: number, updates: Partial<ArticleContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    onChange(newBlocks);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs font-bold uppercase text-black">
          Article Content Blocks
        </label>
      </div>

      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div key={i} className="border-2 border-black p-3 bg-neutral-50 relative flex gap-3">
            <div className="flex flex-col items-center gap-2 pt-1 border-r-2 border-neutral-300 pr-3">
              <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} className="hover:text-[var(--color-primary)] disabled:opacity-30"><GripVertical className="w-4 h-4" /></button>
              <span className="font-mono text-xs font-bold">{i + 1}</span>
              <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} className="hover:text-[var(--color-primary)] disabled:opacity-30"><GripVertical className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-black text-white">{block.type}</span>
                <button type="button" onClick={() => removeBlock(i)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {block.type === 'paragraph' && (
                <textarea
                  rows={4}
                  value={block.content || ''}
                  onChange={(e) => updateBlock(i, { content: e.target.value })}
                  placeholder="Paragraph content..."
                  className="w-full px-3 py-2 border-2 border-black font-serif text-sm bg-white"
                />
              )}

              {block.type === 'image' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={block.imageUrl || ''}
                      onChange={(e) => updateBlock(i, { imageUrl: e.target.value })}
                      placeholder="Image URL"
                      className="flex-1 px-3 py-2 border-2 border-black font-mono text-xs bg-white"
                    />
                    <label className="cursor-pointer px-3 py-2 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-[var(--color-primary)] hover:text-black transition-colors flex items-center">
                      <Upload className="w-3.5 h-3.5 mr-1" /> UPLOAD
                      <input type="file" accept="image/*" onChange={(e) => onUploadImage(i, e)} className="hidden" />
                    </label>
                  </div>
                  {block.imageUrl && <img src={block.imageUrl} alt="preview" className="w-32 h-32 object-cover border-2 border-black" />}
                  <input
                    type="text"
                    value={block.imageAlt || ''}
                    onChange={(e) => updateBlock(i, { imageAlt: e.target.value })}
                    placeholder="Alt text"
                    className="w-full px-3 py-2 border-2 border-black font-sans text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={block.imageCaption || ''}
                    onChange={(e) => updateBlock(i, { imageCaption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="w-full px-3 py-2 border-2 border-black font-sans text-xs bg-white"
                  />
                </div>
              )}

              {block.type === 'code' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={block.codeBlock?.language || ''}
                    onChange={(e) => updateBlock(i, { codeBlock: { ...block.codeBlock, language: e.target.value, code: block.codeBlock?.code || '' } })}
                    placeholder="Language (e.g., typescript)"
                    className="w-full px-3 py-2 border-2 border-black font-mono text-xs bg-white"
                  />
                  <textarea
                    rows={4}
                    value={block.codeBlock?.code || ''}
                    onChange={(e) => updateBlock(i, { codeBlock: { ...block.codeBlock, code: e.target.value, language: block.codeBlock?.language || 'text' } })}
                    placeholder="// Code..."
                    className="w-full px-3 py-2 border-2 border-black font-mono text-xs bg-white"
                  />
                </div>
              )}

              {block.type === 'takeaways' && (
                <textarea
                  rows={3}
                  value={block.items?.join('\n') || ''}
                  onChange={(e) => updateBlock(i, { items: e.target.value.split('\n') })}
                  placeholder="Takeaways (one per line)..."
                  className="w-full px-3 py-2 border-2 border-black font-sans text-sm bg-white"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="button" onClick={() => addBlock('paragraph')} className="px-3 py-1.5 bg-neutral-200 border-2 border-black font-mono text-xs font-bold uppercase hover:bg-neutral-300 flex items-center">
          <PlusCircle className="w-3 h-3 mr-1" /> Paragraph
        </button>
        <button type="button" onClick={() => addBlock('image')} className="px-3 py-1.5 bg-neutral-200 border-2 border-black font-mono text-xs font-bold uppercase hover:bg-neutral-300 flex items-center">
          <PlusCircle className="w-3 h-3 mr-1" /> Image
        </button>
        <button type="button" onClick={() => addBlock('code')} className="px-3 py-1.5 bg-neutral-200 border-2 border-black font-mono text-xs font-bold uppercase hover:bg-neutral-300 flex items-center">
          <PlusCircle className="w-3 h-3 mr-1" /> Code
        </button>
        <button type="button" onClick={() => addBlock('takeaways')} className="px-3 py-1.5 bg-neutral-200 border-2 border-black font-mono text-xs font-bold uppercase hover:bg-neutral-300 flex items-center">
          <PlusCircle className="w-3 h-3 mr-1" /> Takeaways
        </button>
      </div>
    </div>
  );
};
