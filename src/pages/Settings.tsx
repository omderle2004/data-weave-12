import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team settings</h1>
        </div>

        {/* Team Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input defaultValue="My Team" className="max-w-md" />
              <Button variant="secondary">Save</Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Dark mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="border rounded-lg p-4 relative">
                <Badge className="absolute -top-2 left-4 bg-foreground text-background text-xs">
                  Current plan
                </Badge>
                <div className="space-y-4 mt-2">
                  <h3 className="font-semibold">Free plan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Team members</span>
                      <span className="text-muted-foreground">Limited</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI messages</span>
                      <span className="text-muted-foreground">Limited</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span className="text-muted-foreground">Limited</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="border rounded-lg p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Pro plan</h3>
                    <span className="text-sm font-medium">$20 /user/month</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Team members</span>
                      <span className="text-muted-foreground">Many</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI messages</span>
                      <span className="text-muted-foreground">Many</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span className="text-muted-foreground">Unlimited</span>
                    </div>
                  </div>
                  <Button className="w-full">Upgrade to Pro</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Team members <span className="text-primary">(manage)</span></span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Your AI messages</span>
              <span className="font-medium">0</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn more on our <span className="text-primary">pricing page</span>
            </p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Improve AI results</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve AI results by allowing Quadratic to store and analyze user prompts.
                </p>
                <p className="text-sm text-primary">Learn more</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>When using AI features your data is sent to our AI providers:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span><strong>OpenAI:</strong> zero-day data retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span><strong>Anthropic:</strong> zero-day data retention</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}