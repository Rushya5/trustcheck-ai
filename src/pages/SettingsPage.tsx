import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  Bell, 
  Database,
  Key,
  Blocks,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Configure your TrustCheck AI instance"
      />

      <div className="p-6 max-w-4xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="gap-2">
              <Blocks className="h-4 w-4" />
              Blockchain
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="forensic-card p-6 space-y-6">
              <h3 className="font-semibold text-foreground">Profile Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input defaultValue="TrustCheck Labs" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue="admin@trustcheck.ai" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input defaultValue="https://api.trustcheck.ai/v1" disabled />
                <p className="text-xs text-muted-foreground">Contact support to change API endpoint</p>
              </div>
            </div>

            <div className="forensic-card p-6 space-y-6">
              <h3 className="font-semibold text-foreground">Analysis Defaults</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Auto-analyze uploads</p>
                    <p className="text-sm text-muted-foreground">Automatically start analysis when files are uploaded</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Include contextual verification</p>
                    <p className="text-sm text-muted-foreground">Run reverse search and timeline checks by default</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Generate blockchain proof</p>
                    <p className="text-sm text-muted-foreground">Record analysis results on blockchain</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="forensic-card p-6 space-y-6">
              <h3 className="font-semibold text-foreground">API Keys</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Production API Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="sk_live_xxxxxxxxxxxx" className="font-mono" />
                    <Button variant="outline">
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Test API Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" defaultValue="sk_test_xxxxxxxxxxxx" className="font-mono" />
                    <Button variant="outline">
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="forensic-card p-6 space-y-6">
              <h3 className="font-semibold text-foreground">Access Control</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for all team members</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">IP Allowlist</p>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="forensic-card p-6 space-y-6">
              <h3 className="font-semibold text-foreground">Email Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Analysis complete</p>
                    <p className="text-sm text-muted-foreground">Notify when analysis finishes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Deepfake detected</p>
                    <p className="text-sm text-muted-foreground">Alert when manipulation is found</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly summary</p>
                    <p className="text-sm text-muted-foreground">Receive weekly analysis reports</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <div className="forensic-card p-6 space-y-6">
              <h3 className="font-semibold text-foreground">Blockchain Configuration</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Input defaultValue="Polygon PoS (Mainnet)" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Contract Address</Label>
                  <Input defaultValue="0x1234...5678" className="font-mono" disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Auto-record to blockchain</p>
                    <p className="text-sm text-muted-foreground">Automatically record all analysis results</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button variant="forensic">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
