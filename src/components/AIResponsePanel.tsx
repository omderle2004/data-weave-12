import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Code, BarChart3, FileText, Image } from 'lucide-react';

interface AIResponse {
  id: string;
  type: 'text' | 'code' | 'chart' | 'image';
  content: string;
  timestamp: Date;
}

interface AIResponsePanelProps {
  responses: AIResponse[];
  isLoading?: boolean;
}

export function AIResponsePanel({ responses, isLoading = false }: AIResponsePanelProps) {
  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="h-4 w-4" />;
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'chart': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'image': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Response</h3>
          {isLoading && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          AI analysis and responses appear here
        </p>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 p-4">
        {responses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No responses yet</p>
            <p className="text-xs mt-1">Ask a question to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <Card key={response.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`${getResponseTypeColor(response.type)} flex items-center gap-1`}
                    >
                      {getResponseIcon(response.type)}
                      {response.type}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {response.content}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {response.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground p-4 border-t border-border">
        <span>Responses: {responses.length}</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          AI Ready
        </span>
      </div>
    </div>
  );
}