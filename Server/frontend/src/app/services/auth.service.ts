import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentTokenSubject: BehaviorSubject<string | null>;

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('token');
    this.currentTokenSubject = new BehaviorSubject<string | null>(storedToken);
  }

  public get currentTokenValue() {
    return this.currentTokenSubject.value;
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/api/authenticate`, { username, password })
      .pipe(
        map((response) => {
          localStorage.setItem('token', response.token);
          this.currentTokenSubject.next(response.token);
          return response.token;
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentTokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.currentTokenSubject.value;
    if (!token) return false;

    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;

    const now = new Date().getTime();
    const tokenExpiration = decoded.exp * 1000;
    return tokenExpiration > now;
  }
}
