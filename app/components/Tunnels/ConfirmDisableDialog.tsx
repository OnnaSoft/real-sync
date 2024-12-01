import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDisableDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  tunnelDomain: string;
}

export const ConfirmDisableDialog: React.FC<ConfirmDisableDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  tunnelDomain,
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to disable this tunnel?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will disable the tunnel for <span className="font-semibold">{tunnelDomain}</span>. 
            You can re-enable it at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600">
            Disable
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

