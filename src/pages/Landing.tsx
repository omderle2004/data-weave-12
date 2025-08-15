import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Database, Sparkles, Users, Zap, FileText } from "lucide-react";
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
          <span className="text-xl font-bold text-white">DataSpace</span>
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
              The AI Business Intelligence Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Business Intelligence</span> Platform
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Chat with your data and get insights in seconds. Upload CSV files, ask questions in natural language, and let AI generate comprehensive reports and visualizations for your business.
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
              <p className="text-gray-400 text-sm">Ask questions in plain English and get instant answers. No SQL or complex formulas required.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Database className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Multi-Format Support</h3>
              <p className="text-gray-400 text-sm">Upload CSV files, Excel sheets, connect Google Sheets, or integrate with your existing databases.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Auto-Generated Reports</h3>
              <p className="text-gray-400 text-sm">Beautiful, interactive dashboards and reports generated automatically from your data insights.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Real-Time Insights</h3>
              <p className="text-gray-400 text-sm">Get insights in seconds, not hours. Our platform handles the entire analytics pipeline automatically.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Data?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start analyzing your business data today with our AI-powered platform. No technical expertise required.
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
        </div>
      </main>
    </div>
  );
}