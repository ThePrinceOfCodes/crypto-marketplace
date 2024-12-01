export interface CommunityHistoryDialogUser {
    user_email: string;
    user_id: string;
}

export interface CommunityHistoryDialogProps {
    user?: CommunityHistoryDialogUser;
    onClose?: () => void;
}