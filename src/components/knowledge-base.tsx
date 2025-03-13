import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe2, FileText, Upload, Download, PenTool, CircleDot } from 'lucide-react';

interface KnowledgeBaseProps {
  knowledge: string;
  onKnowledgeChange: (value: string) => void;
}

export function KnowledgeBase({ knowledge, onKnowledgeChange }: KnowledgeBaseProps) {
  return (
    <Card className="min-h-[calc(100vh-8rem)] p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Knowledge Base</h2>
        <Button variant="outline" size="sm" className="text-muted-foreground">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Custom Knowledge
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CircleDot className="w-3 h-3 mr-1 text-green-500" />
              Active
            </Badge>
          </div>
        </div>
        <Textarea
          placeholder="Add custom knowledge for your chatbot..."
          value={knowledge}
          onChange={(e) => onKnowledgeChange(e.target.value)}
          className="min-h-[200px] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 border-2 border-dashed relative">
          <Badge className="absolute top-3 right-3 bg-primary/10 text-primary hover:bg-primary/20">
            Coming Next
          </Badge>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            Import from Website
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add knowledge by importing content from a website's sitemap
          </p>
          <div className="space-y-4">
            <Input placeholder="Enter website URL..." className="w-full bg-muted/5" disabled />
            <Button className="w-full" disabled>
              <Download className="w-4 h-4 mr-2" />
              Import Sitemap
            </Button>
          </div>
        </Card>

        <Card className="p-4 border-2 border-dashed relative">
          <Badge className="absolute top-3 right-3 bg-primary/10 text-primary hover:bg-primary/20">
            Coming Next
          </Badge>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Upload Documents
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Support for PDF, DOCX, XLSX, and more file formats
          </p>
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/5">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag & drop files or click to upload</p>
          </div>
        </Card>
      </div>
    </Card>
  );
}
