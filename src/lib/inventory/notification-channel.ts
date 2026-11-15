import type { InventoryNotification } from '@/features/inventory/types';

export interface NotificationChannel {
  readonly channelName: string;
  send(
    uid: string,
    notification: Omit<InventoryNotification, 'id' | 'createdAt'>,
  ): Promise<InventoryNotification>;
}

/**
 * In-app notification channel persisted to the user's notifications collection.
 * Future channels (FCM, Email) can implement NotificationChannel behind this interface.
 */
export class InAppNotificationChannel implements NotificationChannel {
  readonly channelName = 'in_app';

  constructor(
    private readonly persistFn: (
      uid: string,
      notification: Omit<InventoryNotification, 'id' | 'createdAt'>,
    ) => Promise<InventoryNotification>,
  ) {}

  async send(
    uid: string,
    notification: Omit<InventoryNotification, 'id' | 'createdAt'>,
  ): Promise<InventoryNotification> {
    return this.persistFn(uid, notification);
  }
}
