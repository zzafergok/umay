'use client';

import * as React from 'react';
import { Plus, Tag, X } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';

interface TagsInputProps {
  tags: string[];
  onChange: (next: string[]) => void;
}

export function TagsInput({ tags, onChange }: TagsInputProps) {
  const [draft, setDraft] = React.useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (
      tags.some(
        (t) => t.toLocaleLowerCase('tr') === trimmed.toLocaleLowerCase('tr'),
      )
    ) {
      setDraft('');
      return;
    }
    if (tags.length >= 20) return;
    onChange([...tags, trimmed]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor="item-tags-input"
        className="font-mono text-2xs uppercase tracking-wider text-ash"
      >
        Etiketler (Opsiyonel)
      </Label>
      <div className="flex gap-2">
        <Input
          id="item-tags-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Örn. acil, ofis, yedek (Enter)"
          className="h-9 text-xs"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Ekle
        </Button>
      </div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
              <Tag className="text-text-muted h-3 w-3" />
              <span>{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                aria-label={`${tag} etiketini kaldır`}
                className="hover:bg-danger/15 hover:text-danger h-4 w-4 rounded-full p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
