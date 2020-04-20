import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  serverUrl = environment.serverUrl;

  constructor(public http: HttpClient, public snackBar: MatSnackBar, public router: Router) { }

  openSnackBarFail(message, action) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackBarFail']
    });
  }

  openSnackBarSuccess(message, action) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackBarSuccess']
    });
  }

  login(values) {
    return this.http.post(this.serverUrl + '/auth/local', values).pipe(
      tap((data: any) => {
        localStorage.setItem('currentUser', data.token);
      })
    );
  }

  userRegistration(values) {
    return this.http.post(this.serverUrl + '/api/users', values);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
