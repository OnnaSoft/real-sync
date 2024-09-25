import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Pencil,
  Trash2,
  Phone,
  Video,
  MessageSquare,
  Key,
  Server,
} from "lucide-react";

interface ApiKey {
  id: string;
  key: string;
  lastUsed: Date | null;
}

interface DedicatedServer {
  size: string;
  price: number;
}

interface App {
  id: string;
  name: string;
  description: string;
  enableCalls: boolean;
  enableVideoCalls: boolean;
  enableConversationLogging: boolean;
  apiKeys: ApiKey[];
  dedicatedServer: DedicatedServer | null;
}

const dedicatedServerOptions: DedicatedServer[] = [
  { size: "Small", price: 20 },
  { size: "Medium", price: 50 },
  { size: "Large", price: 100 },
  { size: "XLarge", price: 250 },
  { size: "XXLarge", price: 500 },
];

// Simulación de un servicio de aplicaciones
const appService = {
  createApp: (app: Omit<App, "id" | "apiKeys">) =>
    new Promise<App>((resolve) =>
      setTimeout(
        () =>
          resolve({
            ...app,
            id: `app-${Date.now()}`,
            apiKeys: [],
          }),
        1000
      )
    ),
  updateApp: (app: App) =>
    new Promise<App>((resolve) => setTimeout(() => resolve(app), 1000)),
  deleteApp: (id: string) =>
    new Promise<void>((resolve) => setTimeout(resolve, 1000)),
  createApiKey: (appId: string) =>
    new Promise<ApiKey>((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: `key-${Date.now()}`,
            key: `api-${Math.random().toString(36).substr(2, 9)}`,
            lastUsed: null,
          }),
        1000
      )
    ),
  deleteApiKey: (appId: string, keyId: string) =>
    new Promise<void>((resolve) => setTimeout(resolve, 1000)),
};

function ApiKeysModal({
  app,
  onCreateKey,
  onDeleteKey,
}: {
  app: App;
  onCreateKey: () => void;
  onDeleteKey: (keyId: string) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          Manage API Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>API Keys for {app.name}</DialogTitle>
          <DialogDescription>
            Create and manage API keys for this application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {app.apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between">
              <div>
                <code className="text-sm bg-gray-100 p-1 rounded">
                  {key.key}
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  {key.lastUsed
                    ? `Last used: ${key.lastUsed.toLocaleString()}`
                    : "Never used"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteKey(key.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={onCreateKey}>
            <Key className="h-4 w-4 mr-2" />
            Create New API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Communication() {
  const [apps, setApps] = useState<App[]>([
    {
      id: "app-1",
      name: "Chat App",
      description: "Real-time messaging application",
      enableCalls: true,
      enableVideoCalls: false,
      enableConversationLogging: true,
      apiKeys: [
        {
          id: "key-1",
          key: "api-abc123",
          lastUsed: new Date(2023, 5, 15, 10, 30),
        },
        { id: "key-2", key: "api-def456", lastUsed: null },
      ],
      dedicatedServer: null,
    },
    {
      id: "app-2",
      name: "Video Conferencing",
      description: "High-quality video calls",
      enableCalls: true,
      enableVideoCalls: true,
      enableConversationLogging: false,
      apiKeys: [
        {
          id: "key-3",
          key: "api-ghi789",
          lastUsed: new Date(2023, 6, 1, 14, 45),
        },
      ],
      dedicatedServer: { size: "Medium", price: 50 },
    },
  ]);
  const [newApp, setNewApp] = useState<Omit<App, "id" | "apiKeys">>({
    name: "",
    description: "",
    enableCalls: false,
    enableVideoCalls: false,
    enableConversationLogging: false,
    dedicatedServer: null,
  });
  const [editingApp, setEditingApp] = useState<App | null>(null);

  const handleCreateApp = async () => {
    try {
      const createdApp = await appService.createApp(newApp);
      setApps([...apps, createdApp]);
      setNewApp({
        name: "",
        description: "",
        enableCalls: false,
        enableVideoCalls: false,
        enableConversationLogging: false,
        dedicatedServer: null,
      });
    } catch (error) {
      console.error("Error creating app:", error);
      alert("Failed to create app. Please try again.");
    }
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;
    try {
      const updatedApp = await appService.updateApp(editingApp);
      setApps(apps.map((app) => (app.id === updatedApp.id ? updatedApp : app)));
      setEditingApp(null);
    } catch (error) {
      console.error("Error updating app:", error);
      alert("Failed to update app. Please try again.");
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      await appService.deleteApp(id);
      setApps(apps.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error deleting app:", error);
      alert("Failed to delete app. Please try again.");
    }
  };

  const handleCheckboxChange = (
    field: keyof Omit<
      App,
      "id" | "name" | "description" | "apiKeys" | "dedicatedServer"
    >
  ) => {
    if (editingApp) {
      setEditingApp({ ...editingApp, [field]: !editingApp[field] });
    } else {
      setNewApp({ ...newApp, [field]: !newApp[field] });
    }
  };

  const handleServerChange = (value: string) => {
    const server = dedicatedServerOptions.find((s) => s.size === value) || null;
    if (editingApp) {
      setEditingApp({ ...editingApp, dedicatedServer: server });
    } else {
      setNewApp({ ...newApp, dedicatedServer: server });
    }
  };

  const handleCreateApiKey = async (appId: string) => {
    try {
      const newKey = await appService.createApiKey(appId);
      setApps(
        apps.map((app) =>
          app.id === appId ? { ...app, apiKeys: [...app.apiKeys, newKey] } : app
        )
      );
    } catch (error) {
      console.error("Error creating API key:", error);
      alert("Failed to create API key. Please try again.");
    }
  };

  const handleDeleteApiKey = async (appId: string, keyId: string) => {
    try {
      await appService.deleteApiKey(appId, keyId);
      setApps(
        apps.map((app) =>
          app.id === appId
            ? { ...app, apiKeys: app.apiKeys.filter((key) => key.id !== keyId) }
            : app
        )
      );
    } catch (error) {
      console.error("Error deleting API key:", error);
      alert("Failed to delete API key. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Manage Applications</h2>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>
            {editingApp ? "Edit Application" : "Create New Application"}
          </CardTitle>
          <CardDescription>
            {editingApp
              ? "Update application details"
              : "Add a new application to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Application Name"
              value={editingApp ? editingApp.name : newApp.name}
              onChange={(e) =>
                editingApp
                  ? setEditingApp({ ...editingApp, name: e.target.value })
                  : setNewApp({ ...newApp, name: e.target.value })
              }
            />
            <Input
              placeholder="Application Description"
              value={editingApp ? editingApp.description : newApp.description}
              onChange={(e) =>
                editingApp
                  ? setEditingApp({
                      ...editingApp,
                      description: e.target.value,
                    })
                  : setNewApp({ ...newApp, description: e.target.value })
              }
            />
            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="enableCalls"
                checked={
                  editingApp ? editingApp.enableCalls : newApp.enableCalls
                }
                onCheckedChange={() => handleCheckboxChange("enableCalls")}
              />
              <Label htmlFor="enableCalls">Enable Calls</Label>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="enableVideoCalls"
                checked={
                  editingApp
                    ? editingApp.enableVideoCalls
                    : newApp.enableVideoCalls
                }
                onCheckedChange={() => handleCheckboxChange("enableVideoCalls")}
              />
              <Label htmlFor="enableVideoCalls">Enable Video Calls</Label>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                id="enableConversationLogging"
                checked={
                  editingApp
                    ? editingApp.enableConversationLogging
                    : newApp.enableConversationLogging
                }
                onCheckedChange={() =>
                  handleCheckboxChange("enableConversationLogging")
                }
              />
              <Label htmlFor="enableConversationLogging">
                Enable Conversation Logging
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dedicatedServer">Dedicated Server</Label>
              <Select
                onValueChange={handleServerChange}
                value={
                  editingApp?.dedicatedServer?.size ||
                  newApp.dedicatedServer?.size ||
                  "-"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a server size" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="-" className="cursor-pointer">
                    No dedicated server
                  </SelectItem>
                  {dedicatedServerOptions.map((option) => (
                    <SelectItem
                      key={option.size}
                      className="cursor-pointer"
                      value={option.size}
                    >
                      {option.size} - ${option.price}/month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={editingApp ? handleUpdateApp : handleCreateApp}>
              {editingApp ? "Update Application" : "Create Application"}
            </Button>
            {editingApp && (
              <Button variant="outline" onClick={() => setEditingApp(null)}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>Manage your existing applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Dedicated Server</TableHead>
                <TableHead>API Keys</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {app.enableCalls && <Phone className="h-4 w-4" />}
                      {app.enableVideoCalls && <Video className="h-4 w-4" />}
                      {app.enableConversationLogging && (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {app.dedicatedServer ? (
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4" />
                        <span>
                          {app.dedicatedServer.size} - $
                          {app.dedicatedServer.price}/month
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No dedicated server</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ApiKeysModal
                      app={app}
                      onCreateKey={() => handleCreateApiKey(app.id)}
                      onDeleteKey={(keyId) => handleDeleteApiKey(app.id, keyId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingApp(app)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteApp(app.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
