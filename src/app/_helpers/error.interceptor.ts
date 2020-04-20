import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsersService } from '../_services/users.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private userService: UsersService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                // this.userService.logout('Your Session has Expired.Please Login again to Continue');
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }));
    }
}
