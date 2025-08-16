import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Image, GripVertical } from 'lucide-react';
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
    <PanelGroup direction="vertical" className="h-full w-full">
      <Panel defaultSize={65} minSize={35}>
        <div className="h-full w-full overflow-hidden">
          {children}
        </div>
      </Panel>
      
      <PanelResizeHandle className="h-2 bg-border hover:bg-primary/20 transition-colors cursor-row-resize flex items-center justify-center shrink-0">
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
      </PanelResizeHandle>
      
      <Panel defaultSize={35} minSize={25} maxSize={75}>
        <PanelGroup direction="horizontal" className="h-full">
          {/* Input Section - Left aligned with columns A-H */}
          <Panel defaultSize={38} minSize={30} maxSize={60}>
            <div className="h-full bg-card border-t border-border flex flex-col">
              {/* Header */}
              <div className="p-3 lg:p-4 border-b border-border shrink-0">
                <h3 className="font-semibold text-sm">Ask Me a Question</h3>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  Get help with your spreadsheet, analyze data, or ask questions about your content
                </p>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-3 lg:p-4 flex flex-col min-h-0">
                <div className="flex-1 mb-3 lg:mb-4 min-h-0">
                  <Textarea
                    placeholder="What would you like to know about your data? You can type here or use the voice button to speak your question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[60px] lg:min-h-[80px] resize-none text-sm h-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1 lg:gap-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                      <Paperclip className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 lg:h-8 lg:w-8 p-0">
                      <Image className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <VoiceInput onTranscription={handleVoiceTranscription} />
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim() || isAiLoading}
                    className="h-7 lg:h-8 text-xs lg:text-sm"
                  >
                    <Send className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    {isAiLoading ? 'Sending...' : 'Send'}
                  </Button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-border shrink-0">
                  <span className="hidden sm:inline">Model: GPT-4</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </Panel>
          
          {/* Draggable Divider */}
          <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex items-center justify-center">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </PanelResizeHandle>
          
          {/* Output Section - Right aligned with columns I-Z */}
          <Panel defaultSize={62} minSize={40} maxSize={70}>
            <div className="h-full border-t border-border">
              <AIResponsePanel responses={aiResponses} isLoading={isAiLoading} />
            </div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
}