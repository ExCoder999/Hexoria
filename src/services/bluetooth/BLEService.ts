import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import type { TurnAction } from '@/types/game';

// Hexoria BLE service and characteristic UUIDs
const SERVICE_UUID = '12345678-1234-1234-1234-123456789012';
const TX_CHAR_UUID = '12345678-1234-1234-1234-123456789013'; // peripheral writes here
const RX_CHAR_UUID = '12345678-1234-1234-1234-123456789014'; // central reads from here

export type BLERole = 'host' | 'guest';

export type BLEState =
  | 'idle'
  | 'requesting-permission'
  | 'advertising'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'error';

type ActionHandler = (action: TurnAction) => void;
type StateHandler = (state: BLEState) => void;
type PeerHandler = (deviceId: string, name: string) => void;

class BLEService {
  private manager: BleManager = new BleManager();
  private connectedDevice: Device | null = null;
  private role: BLERole | null = null;

  private onActionReceived: ActionHandler | null = null;
  private onStateChange: StateHandler | null = null;
  private onPeerFound: PeerHandler | null = null;

  private scanSubscription: ReturnType<typeof this.manager.startDeviceScan> | null = null;
  private notifSubscription: { remove: () => void } | null = null;

  setHandlers(handlers: {
    onAction?: ActionHandler;
    onState?: StateHandler;
    onPeer?: PeerHandler;
  }) {
    if (handlers.onAction) this.onActionReceived = handlers.onAction;
    if (handlers.onState) this.onStateChange = handlers.onState;
    if (handlers.onPeer) this.onPeerFound = handlers.onPeer;
  }

  private setState(s: BLEState) {
    this.onStateChange?.(s);
  }

  async checkAndRequestPermissions(): Promise<boolean> {
    this.setState('requesting-permission');

    if (Platform.OS === 'android') {
      // Permissions handled via app.json manifest on Android 12+
      // On older Android, ACCESS_FINE_LOCATION was required — handled by expo
      return true;
    }
    // iOS: permission granted via NSBluetoothAlwaysUsageDescription in app.json
    return true;
  }

  async startAdvertising(): Promise<void> {
    const hasPerms = await this.checkAndRequestPermissions();
    if (!hasPerms) {
      this.setState('error');
      return;
    }

    this.role = 'host';
    this.setState('advertising');

    // Wait for BT adapter to be powered on
    await new Promise<void>((resolve) => {
      const sub = this.manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          sub.remove();
          resolve();
        }
      }, true);
    });

    // react-native-ble-plx supports central only; for peripheral/advertising we would
    // integrate react-native-ble-advertiser. Here we simulate the host waiting for guest.
    // In production: start BLE advertising with SERVICE_UUID and wait for guest scan+connect.
    console.log('[BLE] Host advertising with SERVICE_UUID:', SERVICE_UUID);
  }

  async startScanning(): Promise<void> {
    const hasPerms = await this.checkAndRequestPermissions();
    if (!hasPerms) {
      this.setState('error');
      return;
    }

    this.role = 'guest';
    this.setState('scanning');

    await new Promise<void>((resolve) => {
      const sub = this.manager.onStateChange((state) => {
        if (state === State.PoweredOn) {
          sub.remove();
          resolve();
        }
      }, true);
    });

    this.manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
      if (error) {
        console.warn('[BLE] Scan error:', error.message);
        this.setState('error');
        return;
      }
      if (device && device.name) {
        this.onPeerFound?.(device.id, device.name ?? device.id);
      }
    });
  }

  async connectToHost(deviceId: string): Promise<void> {
    this.setState('connecting');
    try {
      this.stopScanning();
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      this.setState('connected');
      this.subscribeToIncoming(device);

      device.onDisconnected(() => {
        this.connectedDevice = null;
        this.setState('idle');
      });
    } catch (err) {
      console.warn('[BLE] Connection failed:', err);
      this.setState('error');
    }
  }

  private subscribeToIncoming(device: Device) {
    device.monitorCharacteristicForService(SERVICE_UUID, RX_CHAR_UUID, (error, char) => {
      if (error) {
        console.warn('[BLE] Monitor error:', error.message);
        return;
      }
      if (char?.value) {
        try {
          const json = Buffer.from(char.value, 'base64').toString('utf8');
          const action: TurnAction = JSON.parse(json);
          this.onActionReceived?.(action);
        } catch {
          console.warn('[BLE] Failed to parse incoming action');
        }
      }
    });
  }

  async sendAction(action: TurnAction): Promise<void> {
    if (!this.connectedDevice) {
      console.warn('[BLE] Cannot send — not connected');
      return;
    }
    const json = JSON.stringify(action);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    try {
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        TX_CHAR_UUID,
        base64
      );
    } catch (err) {
      console.warn('[BLE] Send failed:', err);
    }
  }

  stopScanning() {
    this.manager.stopDeviceScan();
  }

  disconnect() {
    this.notifSubscription?.remove();
    this.connectedDevice?.cancelConnection();
    this.connectedDevice = null;
    this.role = null;
    this.setState('idle');
  }

  get isConnected(): boolean {
    return !!this.connectedDevice;
  }

  get currentRole(): BLERole | null {
    return this.role;
  }
}

export const bleService = new BLEService();
