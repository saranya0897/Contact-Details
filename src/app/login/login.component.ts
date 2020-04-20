import { Component, OnInit } from '@angular/core';
import { UsersService } from '../_services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login = true;
  signUp: boolean;
  email: any;
  password: any;
  hide: any;
  mobileno: any;
  name: any;
  vpwd: any;
  constructor(public userService: UsersService, public router: Router) { }

  ngOnInit() {
  }

  onSubmit(loginForm) {
    if (loginForm.valid) {
      this.userService.login(loginForm.value).subscribe(data => {
        this.router.navigate(['/contacts']);
      }, err => {
        this.userService.openSnackBarFail(err, 'X');
      });
    }
  }

  register(registratrionValue) {
    if (registratrionValue.valid) {
      this.userService.userRegistration(registratrionValue.value).subscribe(data => {
        registratrionValue.resetForm();
        this.userService.openSnackBarSuccess('Registered Successfully', 'X');
        this.signUp = false; this.login = true;
      }, err => {
        this.userService.openSnackBarFail(err, 'X');
      });
    }
  }
}
