declare global {
  /**
   * Global Control4 API object
   */
  const C4: {
    // Registry functions
    RegistryDeleteValue(key: number): void;
    RegistryGetValue(key: number): any;
    
    // Version and system info
    GetVersionInfo(): {
      buildtime: string;
      builddate: string;
      version: string;
      buildtype: string;
    };
    
    // State management
    InvalidateState(): void;
    
    // Encoding
    Encode(data: string, data_encoding: 'NONE' | 'HEX' | 'BASE64'): string;
    
    // File operations
    FileClose(handle: number): void;
    FileDelete(filename: string): boolean;
    FileExists(filename: string): boolean;
    FileGetFreeSpace(): number;
    FileGetSize(handle: number): number;
    FileOpen(filename: string, mode: string): number;
    FileRead(handle: number, count: number): string;
    FileWrite(handle: number, data: string): number;
    
    // Network operations
    NetworkConnect(idBinding: number, host: string, port: number): boolean;
    NetworkDisconnect(idBinding: number): void;
    NetworkListen(idBinding: number, port: number): boolean;
    NetworkSend(idBinding: number, data: string): boolean;
    
    // Property management
    UpdateProperty(propertyName: string, value: any): void;
    GetProperty(propertyName: string): any;
    
    // Event management
    FireEvent(eventName: string, params?: any): void;
    FireEventByID(eventID: number, params?: any): void;
    
    // Proxy communication
    SendToProxy(idBinding: number, command: string, params?: any): void;
    
    // Device management
    GetDeviceID(): number;
    GetDeviceVariables(deviceID: number): any;
    GetDriverConfigXML(): string;
    
    // Room management
    GetRoomID(): number;
    SetRoomSelection(roomID: number): void;
    
    // Navigator communication
    SendToNavigator(data: any): void;
    
    // Capability management
    GetCapability(capabilityName: string): any;
    SetCapability(capabilityName: string, value: any): void;
    
    // Utility functions
    GetLocale(): string;
    GetMACAddress(): string;
    NetworkToHostLong(value: number): number;
    ParseISO8601Date(dateString: string): number;
    
    // Async operations
    AsyncCall(func: Function, ...args: any[]): void;
    
    // XML parsing
    XMLToTable(xmlString: string): any;
    
    // HTTP operations
    HTTPRequest(url: string, method: string, headers?: any, data?: any): void;
    
    // Timer management
    SetTimer(id: number, interval: number): void;
    CancelTimer(id: number): void;
    
    // Logging
    Log(level: string, message: string): void;
    LogError(message: string): void;
    LogInfo(message: string): void;
    LogWarn(message: string): void;
    
    // Allow execution (for development)
    AllowExecute(allow: boolean): void;
  };
}

export {}; 