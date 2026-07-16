import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelDialog({ open, onClose, onConfirm }: CancelDialogProps) {
  const [reason, setReason] = useState('');

  function handleClose() {
    setReason('');
    onClose();
  }

  function handleConfirm() {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setReason('');
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Отменить операцию?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Укажите причину отмены. Изменений в остатках кассы не произойдёт, операция получит статус «Отменена».
        </DialogContentText>
        <TextField
          autoFocus
          multiline
          minRows={3}
          fullWidth
          placeholder="Причина отмены (обязательно)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>← Назад</Button>
        <Button color="error" variant="outlined" disabled={!reason.trim()} onClick={handleConfirm}>
          Подтвердить отмену
        </Button>
      </DialogActions>
    </Dialog>
  );
}
