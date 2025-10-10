import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", displayName: "" });
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.displayName);
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      setVerifyEmail(signupForm.email);
      setShowOTPVerification(true);
      toast({
        title: "Verification Code Sent!",
        description: "Please check your email and enter the 6-digit code.",
      });
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: verifyEmail,
      token: otpCode,
      type: 'email'
    });

    if (error) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email Verified!",
        description: "Your account is now active.",
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const resendOTP = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: verifyEmail,
    });

    if (error) {
      toast({
        title: "Resend Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code Resent!",
        description: "A new verification code has been sent to your email.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/lovable-uploads/f8953591-fc49-4dd1-9fdf-6d69cf74426b.png" 
              alt="SmartBiz AI Logo" 
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-2xl font-bold text-white">SmartBiz AI</span>
          </div>
          <p className="text-gray-300">AI Powered Data and BI Analysis</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white">
              {showOTPVerification ? "Verify Your Email" : "Get Started"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {showOTPVerification 
                ? "Enter the 6-digit code sent to your email" 
                : "Sign in to your account or create a new one"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showOTPVerification ? (
              <form onSubmit={handleOTPVerification} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP 
                      maxLength={6} 
                      value={otpCode}
                      onChange={(value) => setOtpCode(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                        <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  
                  <p className="text-center text-sm text-gray-300">
                    Code sent to: <span className="font-semibold">{verifyEmail}</span>
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Email
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={resendOTP}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-white hover:bg-white/10 w-full"
                    onClick={() => {
                      setShowOTPVerification(false);
                      setOtpCode("");
                    }}
                  >
                    Back to Sign Up
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="login" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-white">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-white">Display Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your display name"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        value={signupForm.displayName}
                        onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Enter your password"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}