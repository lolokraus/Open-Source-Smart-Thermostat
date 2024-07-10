import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { TemperatureReading, HumidityReading, CO2Reading } from '../models/sensorReadings';

@Injectable({
  providedIn: 'root'
})
export class SensorService {
  constructor(private http: HttpClient) { }

  getReadings(sensorType: 'temperature' | 'humidity' | 'co2', params: { startDate: string; endDate: string }): Observable<any> {
    return this.http
      .get<any[]>(`${environment.apiUrl}/api/sensor/${sensorType}`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
        params: params
      })
      .pipe(map((data) => {
        switch (sensorType) {
          case 'temperature': return data.map(this.mapToTemperatureReading);
          case 'humidity': return data.map(this.mapToHumidityReading);
          case 'co2': return data.map(this.mapToCO2Reading);
        }
      }));
  }

  private mapToTemperatureReading(data: any): TemperatureReading {
    return {
      value: data.value,
      heatingOn: Boolean(data.heating_on),
      deviceTimestamp: new Date(data.device_timestamp),
      serverTimestamp: new Date(data.server_timestamp)
    };
  }

  private mapToHumidityReading(data: any): HumidityReading {
    return {
      value: data.value,
      heatingOn: Boolean(data.heating_on),
      deviceTimestamp: new Date(data.device_timestamp),
      serverTimestamp: new Date(data.server_timestamp)
    };
  }

  private mapToCO2Reading(data: any): CO2Reading {
    return {
      value: data.value,
      heatingOn: Boolean(data.heating_on),
      deviceTimestamp: new Date(data.device_timestamp),
      serverTimestamp: new Date(data.server_timestamp)
    };
  }


  private getToken(): string | null {
    return localStorage.getItem('token');
  }
}
