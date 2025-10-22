export interface Telemetry {
    id: string;
    deviceId: string;

    // Device Info
    orientation?: string;
    isRooted?: boolean;
    isEmulator?: boolean;
    screenDensity?: number;
    screenResolution?: string;

    // Memory Info
    totalMemory?: number;
    freeMemory?: number;
    totalStorage?: number;
    freeStorage?: number;
    usedMemoryPercentage?: number;

    // System Info
    brand?: string;
    manufacturer?: string;
    model?: string;
    deviceName?: string;
    product?: string;
    board?: string;
    hardware?: string;

    // OS Info
    sdkVersion?: number;
    androidVersion?: string;
    osVersion?: string;
    codename?: string;
    incremental?: string;
    securityPatch?: string;

    // Battery Info
    batteryPercentage?: string;
    batteryTemperature?: string;
    batteryVoltage?: string;
    batteryCurrent?: string;
    batteryCapacity?: string;
    batteryStatus?: string;
    chargeCounter?: string;
    energyCounter?: string;

    // App Version Info
    appVersion?: string;
    appVersionCode?: number;
    appInstallTime?: string;

    // Network Info
    networkOperator?: string;
    simOperator?: string;
    simCountryISO?: string;

    // Location Info
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    address?: string;

    // Timestamps
    collectedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface TelemetryResponse {
    success: boolean;
    message: string;
    data: {
        telemetry: Telemetry;
    };
    error?: {
        message: string;
        status: number;
        data: unknown;
    };
}
