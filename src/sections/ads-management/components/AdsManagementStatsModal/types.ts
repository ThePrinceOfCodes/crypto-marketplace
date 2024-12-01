export interface AdsManagementStatsDialogProps {
    slugOrUrl: string;
    startAt: string;
    endAt?: string;                                                                          
    onClose?: () => void;
}

export type AdsManagementStatsModalRef = {
open: () => void;
};

