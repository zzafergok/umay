export function wait(duration: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export const defaultCopy = {
  tr: {
    titleConfirm: '{label} Silme Onayı',
    description:
      'Bu {label} kalıcı olarak silinecektir. Bu işlem geri alınamaz.',
    errorDescription:
      'Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
    itemLabel: 'Silinecek {label}',
    permanentBadge: 'Kalıcı işlem',
    cancel: 'Vazgeç',
    confirm: 'Silmeyi Onayla',
    deleting: 'Siliniyor...',
    deletingStatus: 'SİLİNİYOR',
    movingToTrashText: 'Kayıt kaldırılıyor...',
    completingText: 'Silme işlemi tamamlanıyor...',
  },
  en: {
    titleConfirm: 'Confirm {label} Deletion',
    description:
      'This {label} will be permanently deleted. This action cannot be undone.',
    errorDescription: 'An error occurred during deletion. Please try again.',
    itemLabel: '{label} to delete',
    permanentBadge: 'Permanent',
    cancel: 'Cancel',
    confirm: 'Confirm Delete',
    deleting: 'Deleting...',
    deletingStatus: 'DELETING',
    movingToTrashText: 'Removing record...',
    completingText: 'Completing deletion...',
  },
};
