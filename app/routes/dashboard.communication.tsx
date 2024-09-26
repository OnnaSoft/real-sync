"use client";

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
  Server,
} from "lucide-react";
import { useAppSelector } from "../store/hooks";
import { App } from "~/models/app";
import ApiKeysModal from "../components/ApiKeysModal";
import { useAppManagement } from "../hooks/useAppManagement";

export default function Communication() {
  const token = useAppSelector((state) => state.auth.token);
  const [newApp, setNewApp] = useState<Omit<App, "id" | "apiKeys">>({
    name: "",
    description: "",
    enableCalls: false,
    enableVideoCalls: false,
    enableConversationLogging: false,
    dedicatedServer: null,
  });
  const [editingApp, setEditingApp] = useState<App | null>(null);

  const {
    apps,
    createApiKey,
    createApp,
    dedicatedServerPlans,
    deleteApiKey,
    deleteApp,
    updateApp,
  } = useAppManagement(token as string);

  const handleCreateApp = async () => {
    try {
      await createApp(newApp);
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
    }
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;
    try {
      await updateApp(editingApp);
      setEditingApp(null);
    } catch (error) {
      console.error("Error updating app:", error);
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      await deleteApp(id);
    } catch (error) {
      console.error("Error deleting app:", error);
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
    const server = dedicatedServerPlans.find((s) => s.size === value) || null;
    if (editingApp) {
      setEditingApp({ ...editingApp, dedicatedServer: server });
    } else {
      setNewApp({ ...newApp, dedicatedServer: server });
    }
  };

  const handleCreateApiKey = async (appId: string) => {
    try {
      await createApiKey(appId);
    } catch (error) {
      console.error("Error creating API key:", error);
    }
  };

  const handleDeleteApiKey = async (appId: string, keyId: string) => {
    try {
      await deleteApiKey({ appId, keyId });
    } catch (error) {
      console.error("Error deleting API key:", error);
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
                disabled={!!editingApp}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a server size" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="-" className="cursor-pointer">
                    No dedicated server
                  </SelectItem>
                  {dedicatedServerPlans.map((plan) => (
                    <SelectItem
                      key={plan.id}
                      className="cursor-pointer"
                      value={plan.size}
                    >
                      {plan.size} - ${plan.price}/month
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
