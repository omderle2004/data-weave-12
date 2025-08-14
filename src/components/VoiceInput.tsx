import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
}

export function VoiceInput({ onTranscription }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported] = useState('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        toast.success('Listening... Speak your question');
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error('Speech recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast.error('Failed to start voice recording');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-6 w-6 p-0 ${isRecording ? 'text-red-500 hover:text-red-600' : ''}`}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={!isSupported}
    >
      {isRecording ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
    </Button>
  );
}

// Extend window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}