"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Trash2, Key } from "lucide-react";
import { App } from "@/models/app";

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
                    ? `Last used: ${new Date(
                        key.lastUsed
                      ).toLocaleDateString()}`
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

export default ApiKeysModal;
