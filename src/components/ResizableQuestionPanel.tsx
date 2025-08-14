import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Image } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { AIResponsePanel } from './AIResponsePanel';

interface AIResponse {
  id: string;
  type: 'text' | 'code' | 'chart' | 'image';
  content: string;
  timestamp: Date;
}

interface ResizableQuestionPanelProps {
  chatMessage: string;
  setChatMessage: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: () => void;
  children: React.ReactNode;
}

export function ResizableQuestionPanel({ 
  chatMessage, 
  setChatMessage, 
  onSendMessage,
  children 
}: ResizableQuestionPanelProps) {
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleVoiceTranscription = (text: string) => {
    setChatMessage((prev: string) => prev + (prev ? ' ' : '') + text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setIsAiLoading(true);
    onSendMessage();
    
    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const newResponse: AIResponse = {
        id: Date.now().toString(),
        type: 'text',
        content: `I understand you're asking about: "${chatMessage}". This is a demo response. In a real implementation, this would be connected to an AI service.`,
        timestamp: new Date()
      };
      setAiResponses(prev => [...prev, newResponse]);
      setIsAiLoading(false);
    }, 2000);
  };

  return (
    <PanelGroup direction="vertical" className="h-full">
      <Panel defaultSize={60} minSize={40}>
        {children}
      </Panel>
      
      <PanelResizeHandle className="h-2 bg-border hover:bg-primary/20 transition-colors cursor-row-resize flex items-center justify-center">
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
      </PanelResizeHandle>
      
      <Panel defaultSize={40} minSize={20} maxSize={60}>
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-card border-t border-border flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Ask Me a Question</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get help with your spreadsheet, analyze data, or ask questions about your content
                </p>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex-1 mb-4">
                  <Textarea
                    placeholder="What would you like to know about your data? You can type here or use the voice button to speak your question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Image className="h-4 w-4" />
                    </Button>
                    <VoiceInput onTranscription={handleVoiceTranscription} />
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || isAiLoading}
                    className="h-8"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isAiLoading ? 'Sending...' : 'Send'}
                  </Button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  <span>Model: GPT-4</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-1 h-12 bg-muted-foreground/30 rounded-full"></div>
          </PanelResizeHandle>
          
          <Panel defaultSize={50} minSize={30}>
            <AIResponsePanel responses={aiResponses} isLoading={isAiLoading} />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}