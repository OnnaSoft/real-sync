import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Globe, Eye, EyeOff, RefreshCw, ToggleLeft, ToggleRight, Copy, Check, Users } from 'lucide-react';
import { Tunnel } from "@/models/tunnel";
import { ConfirmDisableDialog } from "./ConfirmDisableDialog";
import { useToast } from "@/hooks/use-toast";

interface TunnelRowProps {
  tunnel: Tunnel;
  onToggleStatus: (id: number) => void;
  onGenerateNewApiKey: (id: number) => void;
  onToggleMultipleConnections: (id: number) => void;
}

export const TunnelRow: React.FC<TunnelRowProps> = ({ 
  tunnel, 
  onToggleStatus, 
  onGenerateNewApiKey,
  onToggleMultipleConnections
}) => {
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const handleToggleStatus = () => {
    if (tunnel.isEnabled) {
      setIsConfirmDialogOpen(true);
    } else {
      onToggleStatus(tunnel.id);
    }
  };

  const handleConfirmDisable = () => {
    setIsConfirmDialogOpen(false);
    onToggleStatus(tunnel.id);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tunnel.apiKey);
      setIsCopied(true);
      toast({
        title: "API Key Copied",
        description: "The API key has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy the API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <a
              href={`https://${tunnel.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              https://{tunnel.domain}
            </a>
          </div>
        </TableCell>
        <TableCell className="font-mono">
          <div className="flex items-center space-x-2 w-[350px]">
            <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
              {isApiKeyVisible ? tunnel.apiKey : '••••••••••••••••'}
            </div>
            {isApiKeyVisible && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleApiKeyVisibility}
              title={isApiKeyVisible ? "Hide API Key" : "Show API Key"}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            >
              {isApiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateNewApiKey(tunnel.id)}
              title="Generate New API Key"
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant={tunnel.isEnabled ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleStatus}
              title={tunnel.isEnabled ? "Disable Tunnel" : "Enable Tunnel"}
              className={`${
                tunnel.isEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {tunnel.isEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleMultipleConnections(tunnel.id)}
              title={tunnel.allowMultipleConnections ? "Disable Multiple Connections" : "Enable Multiple Connections"}
              className={`${
                tunnel.allowMultipleConnections
                  ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <ConfirmDisableDialog
        isOpen={isConfirmDialogOpen}
        onConfirm={handleConfirmDisable}
        onCancel={() => setIsConfirmDialogOpen(false)}
        tunnelDomain={tunnel.domain}
      />
    </>
  );
};

