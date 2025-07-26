import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, MessageSquare, Twitter, Mail } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-background px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              <span className="font-semibold text-xl">quadratic</span>
            </div>
            <nav className="flex items-center gap-6">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Forum
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Product
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Solutions
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Resources
              </Button>
            </nav>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Open Quadratic
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact</h1>
          <p className="text-lg text-muted-foreground">
            Questions? Feedback? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Links */}
        <div className="flex justify-center gap-8 mb-12">
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Github className="h-5 w-5" />
            GitHub
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-5 w-5" />
            Community
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Twitter className="h-5 w-5" />
            Twitter/X
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Mail className="h-5 w-5" />
            Email
          </Button>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                First name<span className="text-red-500">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Last name<span className="text-red-500">*</span>
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium mb-2">
              Company name
            </label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email<span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message<span className="text-red-500">*</span>
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full"
            />
          </div>

          {/* reCAPTCHA placeholder */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 border border-gray-300 rounded p-4 flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
              <span className="text-sm">I'm not a robot</span>
              <div className="ml-auto">
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  reCAPTCHA
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Privacy - Terms
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Send
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              <span className="font-semibold text-xl">quadratic</span>
            </div>
            <p className="text-2xl font-bold">The spreadsheet with AI.</p>
          </div>

          <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="ghost" className="p-0 h-auto font-normal">AI</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="ghost" className="p-0 h-auto font-normal">Use Cases</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="ghost" className="p-0 h-auto font-normal">Resources</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span className="text-sm">Star</span>
                <span className="text-sm text-muted-foreground">3,770</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}