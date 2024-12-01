export interface EducationHistoryDialogUser {
    user_email: string;
    user_id: string;
}
export interface EducationHistoryDialogProps {
    user?: EducationHistoryDialogUser;
    onClose?: () => void;
}

export type EducationHistoryDialogRef = {
    open: () => void;
};