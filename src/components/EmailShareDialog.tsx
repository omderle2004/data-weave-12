import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail } from 'lucide-react';

interface EmailShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onSend: (email: string) => void;
  isSending?: boolean;
}

export function EmailShareDialog({
  open,
  onOpenChange,
  userEmail,
  onSend,
  isSending = false,
}: EmailShareDialogProps) {
  const [emailOption, setEmailOption] = useState<'current' | 'custom'>('current');
  const [customEmail, setCustomEmail] = useState('');

  const handleSend = () => {
    const emailToSend = emailOption === 'current' ? userEmail : customEmail;
    
    if (emailOption === 'custom' && !customEmail.trim()) {
      return;
    }
    
    onSend(emailToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Analysis Report via Email
          </DialogTitle>
          <DialogDescription>
            Choose where to send your SmartBiz Analysis Report
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <RadioGroup value={emailOption} onValueChange={(value) => setEmailOption(value as 'current' | 'custom')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="current" id="current" />
              <Label htmlFor="current" className="flex-1 cursor-pointer">
                Send to my email
                <span className="block text-sm text-muted-foreground">{userEmail}</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">
                Send to another email
              </Label>
            </div>
          </RadioGroup>

          {emailOption === 'custom' && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="custom-email">Email Address</Label>
              <Input
                id="custom-email"
                type="email"
                placeholder="Enter email address"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || (emailOption === 'custom' && !customEmail.trim())}>
            {isSending ? 'Sending...' : 'Send Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
