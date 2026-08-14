import React from "react";

export interface UserManualModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialSection?: string;
}

export declare const UserManualModal: React.FC<UserManualModalProps>;
export default UserManualModal;
