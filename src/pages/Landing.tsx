import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Database, Sparkles, Users, Zap, FileText, Mail, MapPin, Linkedin, Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Database className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">SmartBiz AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate('/auth')}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
              <Sparkles className="h-4 w-4" />
              The AI Powered Data Analytics & Business Intelligence Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Powered Data Analytics & Business Intelligence</span> Platform
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-300 mb-6">
            Chat with your data. Unlock insights in seconds.
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Upload your business data, ask questions in plain English, and let AI instantly generate interactive reports, dashboards, and visualizations — with zero coding.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Natural Language Queries</h3>
              <p className="text-gray-400 text-sm">Ask questions like "What were my top 5 products last quarter?" and get instant answers—no SQL, no formulas.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Database className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Multi-Format Support</h3>
              <p className="text-gray-400 text-sm">Upload CSV or Excel files, connect Google Sheets, or integrate with your existing databases.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Auto-Generated Reports</h3>
              <p className="text-gray-400 text-sm">Get beautiful, interactive dashboards automatically built from your raw data.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Real-Time Insights</h3>
              <p className="text-gray-400 text-sm">From upload to insights in seconds—our AI handles the full analytics pipeline for you.</p>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-8">About SmartBiz AI</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                SmartBiz AI is an advanced AI-powered Business Intelligence platform designed to make data analytics simple, fast, and accessible for everyone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                  <h3 className="text-white font-semibold mb-2">No Technical Expertise Required</h3>
                  <p className="text-gray-400 text-sm">Built for everyone, regardless of technical background</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                  <h3 className="text-white font-semibold mb-2">For All Business Sizes</h3>
                  <p className="text-gray-400 text-sm">Built for startups, enterprises, and professionals</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                  <h3 className="text-white font-semibold mb-2">Instant Insights</h3>
                  <p className="text-gray-400 text-sm">Converts raw data into meaningful business insights with just a few clicks</p>
                </div>
              </div>
              <p className="text-lg text-blue-300 text-center">
                Our mission is to help businesses make smarter, data-driven decisions without the complexity of traditional analytics tools.
              </p>
            </div>
          </div>

          {/* Founders Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Founders</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Om Jade</h3>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Om Derle</h3>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Sahil Jadhav</h3>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold">Kajal Kedar</h3>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Email</h3>
                <p className="text-gray-400">smartbizai@gmail.com</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <Database className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Website</h3>
                <p className="text-gray-400">www.smartbizai.com</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <MapPin className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Location</h3>
                <p className="text-gray-400">Nashik, India</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-6">Connect With Us</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/30 transition-colors cursor-pointer">
                <Linkedin className="h-6 w-6 text-blue-400" />
              </div>
              <div className="h-12 w-12 bg-sky-500/20 rounded-lg flex items-center justify-center hover:bg-sky-500/30 transition-colors cursor-pointer">
                <Twitter className="h-6 w-6 text-sky-400" />
              </div>
              <div className="h-12 w-12 bg-blue-800/20 rounded-lg flex items-center justify-center hover:bg-blue-800/30 transition-colors cursor-pointer">
                <Facebook className="h-6 w-6 text-blue-400" />
              </div>
              <div className="h-12 w-12 bg-pink-600/20 rounded-lg flex items-center justify-center hover:bg-pink-600/30 transition-colors cursor-pointer">
                <Instagram className="h-6 w-6 text-pink-400" />
              </div>
              <div className="h-12 w-12 bg-red-600/20 rounded-lg flex items-center justify-center hover:bg-red-600/30 transition-colors cursor-pointer">
                <Youtube className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Data?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start analyzing your business data today with SmartBiz AI.
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => navigate('/auth')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-center">
              © 2025 SmartBiz AI – All Rights Reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}