import { PlatformAffiliateType } from "api/hooks";

export interface IPDAffiliatesListProps {
  platform_id: string;
  name: string;
  categories: string[];
  city: string | undefined;
  activated?: boolean;
  isWaiting: boolean;
  actionMode: "activated" | "deactivated" | "waiting";
  onShowInfo: (item: PlatformAffiliateType) => void;
  onUpdateStore: (item: PlatformAffiliateType) => void;
  onChangeStoreStatus: (
    item: PlatformAffiliateType,
    isDenyMode?: boolean,
  ) => void;
  onDeleteStore: (item: PlatformAffiliateType, isDeleteMode?: boolean) => void;
}
export interface IPDAffiliatesListRef {
  refetch: () => void;
}
