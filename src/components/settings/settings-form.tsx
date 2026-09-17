"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore, type DisplayTheme } from "@/stores/useSettingsStore";
import type { CameraMode } from "@/types/inspection";

export function SettingsForm() {
  const settings = useSettingsStore();
  const { setTheme } = useTheme();

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Camera</CardTitle>
          <CardDescription>
            Browser-accessible stream URL. Private LAN addresses are expected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="stream">Camera stream URL</FieldLabel>
              <Input
                id="stream"
                value={settings.cameraStreamUrl}
                placeholder="http://192.168.x.x:81/stream"
                onChange={(e) => settings.setCameraStreamUrl(e.target.value)}
              />
              <FieldDescription>
                Do not put secrets here. This value is used in the browser.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Camera architecture</FieldLabel>
              <Select
                value={settings.cameraMode}
                onValueChange={(value) =>
                  settings.setCameraMode(value as CameraMode)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MJPEG_STREAM">MJPEG stream</SelectItem>
                  <SelectItem value="LATEST_FRAME">Latest JPEG frame</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="proxy">Use local camera proxy</FieldLabel>
              <Switch
                id="proxy"
                checked={settings.useCameraProxy}
                onCheckedChange={settings.setUseCameraProxy}
              />
            </Field>
            <FieldDescription>
              Enable only if the browser cannot reach the ESP32 directly (CORS).
              Mixed HTTPS/HTTP content cannot be fixed by this proxy if the
              dashboard is served over HTTPS.
            </FieldDescription>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backend</CardTitle>
          <CardDescription>
            REST and WebSocket endpoints for inspection results. Paths are
            defined in src/config/backend.ts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="api">API base URL</FieldLabel>
              <Input
                id="api"
                value={settings.apiBaseUrl}
                placeholder="http://192.168.x.x:5000"
                onChange={(e) => settings.setApiBaseUrl(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="ws">WebSocket URL</FieldLabel>
              <Input
                id="ws"
                value={settings.wsUrl}
                placeholder="ws://192.168.x.x:5000/ws"
                onChange={(e) => settings.setWsUrl(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Theme</FieldLabel>
              <Select
                value={settings.theme}
                onValueChange={(value) => {
                  const theme = value as DisplayTheme;
                  settings.setTheme(theme);
                  setTheme(theme);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="compact">Compact mode</FieldLabel>
              <Switch
                id="compact"
                checked={settings.compactMode}
                onCheckedChange={settings.setCompactMode}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="advanced">Show advanced information</FieldLabel>
              <Switch
                id="advanced"
                checked={settings.showAdvanced}
                onCheckedChange={settings.setShowAdvanced}
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="debug">Debug panel (development)</FieldLabel>
              <Switch
                id="debug"
                checked={settings.debugPanel}
                onCheckedChange={settings.setDebugPanel}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Mode</CardTitle>
          <CardDescription>
            Simulated cycles for development. Never treat demo values as machine
            measurements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="demo">Enable demo mode</FieldLabel>
            <Switch
              id="demo"
              checked={settings.demoMode}
              onCheckedChange={settings.setDemoMode}
            />
          </Field>
          <p className="text-sm text-muted-foreground">
            This page does not expose motor, pneumatic, PLC, or reject control.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              settings.setCameraStreamUrl("");
              settings.setApiBaseUrl("");
              settings.setWsUrl("");
            }}
          >
            Clear connection URLs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
