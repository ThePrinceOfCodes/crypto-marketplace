import { PlatformAffiliateType } from "api/hooks";

export interface IPDAffiliatesInfoDialogProps {
  open: boolean;
  onCancel: () => void;
  data: PlatformAffiliateType | null;
}
