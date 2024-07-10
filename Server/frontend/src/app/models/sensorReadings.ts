export interface TemperatureReading {
  value: number;
  heatingOn: boolean;
  deviceTimestamp: Date;
  serverTimestamp: Date;
}

export interface HumidityReading {
  value: number;
  heatingOn: boolean;
  deviceTimestamp: Date;
  serverTimestamp: Date;
}

export interface CO2Reading {
  value: number;
  heatingOn: boolean;
  deviceTimestamp: Date;
  serverTimestamp: Date;
}
