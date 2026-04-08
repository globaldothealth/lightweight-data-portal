import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {User} from "../../models/User.ts";


interface RemoveUserDialogProps {
    userSelectedToBeDeleted: User | null;
    clearUserSelectedToBeDeleted: () => void;
    deleteUser: (userId: string) => void;
}

export const RemoveUserDialog = ({userSelectedToBeDeleted, clearUserSelectedToBeDeleted, deleteUser}: RemoveUserDialogProps) => <Dialog
    open={userSelectedToBeDeleted !== null}
    onClose={clearUserSelectedToBeDeleted}
    onClick={(e): void => e.stopPropagation()}
>
    <DialogTitle>
        Are you sure you want to delete this user?
    </DialogTitle>
    <DialogContent>
        <DialogContentText>
            User {userSelectedToBeDeleted?.email} will be permanently deleted.
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button
            onClick={clearUserSelectedToBeDeleted}
            color="primary"
            autoFocus
        >
            Cancel
        </Button>
        <Button onClick={() => {
            const userIdToDelete = userSelectedToBeDeleted?.username;
            if (!userIdToDelete) return;
            clearUserSelectedToBeDeleted();
            deleteUser(userIdToDelete);
        }} color="primary" variant='contained'>
            Yes
        </Button>
    </DialogActions>
</Dialog>