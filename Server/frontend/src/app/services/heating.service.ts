import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HeatingService {
  constructor(private http: HttpClient) { }

  getHeatingStatus(): Observable<{ heatingOn: boolean }> {
    return this.http.get<{ heatingOn: boolean }>(`${environment.apiUrl}/api/heating/status`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }

  getHeatingSettings(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/heating/settings`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }

  updateHeatingSettings(settings: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/heating/settings`, settings, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }
}
