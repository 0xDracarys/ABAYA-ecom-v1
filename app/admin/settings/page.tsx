"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface Settings {
  storeName: string
  storeEmail: string
  enableCheckout: boolean
  enableRegistration: boolean
  maintenanceMode: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storeName: "ABAYA E-commerce",
    storeEmail: "admin@abaya-ecom.test",
    enableCheckout: true,
    enableRegistration: true,
    maintenanceMode: false
  })

  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    try {
      setIsSaving(true)
      
      // In a real app, you would save these settings to your database
      // For demo purposes, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully."
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings({
                  ...settings,
                  storeName: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  storeEmail: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Checkout</Label>
                <p className="text-sm text-gray-500">
                  Allow customers to complete purchases
                </p>
              </div>
              <Switch
                checked={settings.enableCheckout}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  enableCheckout: checked
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Registration</Label>
                <p className="text-sm text-gray-500">
                  Allow new customers to create accounts
                </p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  enableRegistration: checked
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-500">
                  Put the store in maintenance mode
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  maintenanceMode: checked
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Clear Cache</h3>
                <p className="text-sm text-gray-500">
                  Clear all cached data from the store
                </p>
              </div>
              <Button variant="destructive">
                Clear Cache
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Reset Demo Data</h3>
                <p className="text-sm text-gray-500">
                  Reset all demo data to its initial state
                </p>
              </div>
              <Button variant="destructive">
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 