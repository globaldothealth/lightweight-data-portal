import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: 'success' | 'error';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({open, title, message, confirmLabel, confirmColor, onConfirm, onCancel}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} color={confirmColor} variant="contained">{confirmLabel}</Button>
            </DialogActions>
        </Dialog>
    );
}

