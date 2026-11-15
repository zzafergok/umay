import type { ButtonProps } from '@/components/core/button';

export interface LogoutButtonProps {
  label?: string;
  loadingLabel?: string;
  redirectTo?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  showIcon?: boolean;
  iconOnly?: boolean;
  className?: string;
  ariaLabel?: string;
  onLoggedOut?: () => void;
}

export interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  redirectTo?: string;
  onDeleted?: () => void;
}

export interface DeleteAccountButtonProps {
  userEmail?: string;
  label?: string;
  redirectTo?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  className?: string;
  onDeleted?: () => void;
}

export interface UserAccountMenuProps {
  className?: string;
}

export interface SidebarUserFooterProps {
  collapsed?: boolean;
}

export interface AccountActionsCopy {
  logoutLabel: string;
  logoutLoadingLabel: string;
  logoutSuccess: string;
  logoutError: string;
  deleteLabel: string;
  deleteDialogTitle: string;
  deleteDialogDescription: string;
  deleteScopeTitle: string;
  deleteScopeItems: string[];
  deleteConfirmEmailLabel: string;
  deleteConfirmEmailPlaceholder: string;
  deleteConfirmMismatch: string;
  deleteCancelLabel: string;
  deleteConfirmLabel: string;
  deleteLoadingLabel: string;
  deleteSuccess: string;
  deleteError: string;
  menuProfile: string;
  menuSettings: string;
  menuAccountLabel: string;
  fallbackName: string;
}
