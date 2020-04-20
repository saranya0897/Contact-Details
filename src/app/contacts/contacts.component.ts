import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ContactService } from '../_services/contact.service';
import { UsersService } from '../_services/users.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})

export class ContactsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'companyname'];
  contactsData;
  singleContactData;
  search: any;
  sortyBy: any = 'createdAt';
  template: boolean;
  columns = ['name', 'email', 'mobile', 'role', 'address'];

  constructor(public dialog: MatDialog, public contactService: ContactService, public userService: UsersService) {
    this.contactService.contactsData.subscribe((data) => {
      this.contactsData = data;
      if (this.contactsData.length > 0) { this.singleContactData = this.contactsData[0]; }
      else {
        this.singleContactData = null;
      }
    });
  }

  ngOnInit() {
    this.getContacts();
    this.contactService.getCustomizeHeader().subscribe((data: any) => {
      this.displayedColumns = _.map(data.filter(data1 => data1.display || data1.default), (x) => x.columnname);
      this.displayedColumns.unshift('select');
      console.log(this.displayedColumns);
    });
  }

  /**
   * @description gets all contact data
   */
  getContacts() {
    this.contactService.getContacts(this.sortyBy).subscribe(data => { });
  }

  /**
   * @description opens the add contact popup
   */
  addContact() {
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      autoFocus: true,
      width: '550px',
      data: { type: 'addContact' }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === 'yes') {
        this.userService.openSnackBarSuccess('Contacts Added Successfully', 'X');
      }
    });
  }

  /**
   *
   * @param contactInfo consists of information to change
   * @description opens edit popupt
   */
  editContact(contactInfo) {
    contactInfo = JSON.parse(JSON.stringify(contactInfo));
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      autoFocus: true,
      width: '550px',
      data: { type: 'addContact', contactData: contactInfo }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data === 'yes') {
        this.singleContactData = contactInfo;
        this.userService.openSnackBarSuccess('Contact Updated Successfully', 'X');
      }
    });
  }

  /**
   *
   * @param row consists of single contact info
   * @description displays the single contact info
   */
  singleContact(row) {
    this.singleContactData = JSON.parse(JSON.stringify(row));
  }

  /**
   *
   * @param contactInfo consists of contact to delete
   * @description deletes the contact
   */
  deleteContact(contactInfo) {
    contactInfo = JSON.parse(JSON.stringify(contactInfo));
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      autoFocus: true,
      width: '400px',
      data: { type: 'deleteContact', contactData: contactInfo }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'yes') {
        console.log(result);
        this.contactService.deleteContact(contactInfo).subscribe(data => {
          this.userService.openSnackBarSuccess('Contact Deleted Successfully', 'X');
        });
      }
    });
  }

  /**
   *
   * @param searchValue consists of searchvalue
   * @description gets the result based upon the search input
   */
  searchContact(searchValue) {
    if (searchValue) {
      this.contactService.searchContact(searchValue).subscribe(data => {
        this.contactsData = data;
      });
    } else {
      this.getContacts();
    }
  }

  /**
   *
   * @param contactData consist of info to send sms
   * @description sends the information
   */
  sendSMS(contactData) {
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      autoFocus: true,
      width: '400px',
      data: { type: 'sendsms' }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result !== 'no') {
        result.toNumber = contactData.mobile;
        this.contactService.sendSMS(result).subscribe(data => {
          this.userService.openSnackBarSuccess('SMS Sent', 'X');
        });
      }
    });
  }

  /**
   *
   * @param fileInput consists of selected file
   * @description uploads contact
   */
  excelFileSelected(fileInput) {
    if (fileInput.target.files.length === 0) { return; }
    const file = fileInput.target.files[0];
    // stores the image in the db
    const formData: any = new FormData();
    formData.append('uploads', file, file.name);
    this.contactService.uploadContact(formData).subscribe((data: any) => {
      this.userService.openSnackBarSuccess('Contact Upload Success', 'X');
    }, err => {
      console.log(typeof err);
      if (typeof err === 'object') {
        this.userService.openSnackBarFail('Some of Requried Fields are missing in file', 'X');
      } else { this.userService.openSnackBarFail(err, 'X'); }
    });
  }

  /**
   * @description downloads the template to upload contact
   */
  downloadTemplate() {
    this.contactService.downloadTemplate().subscribe((data: any) => {
      window.open(data.url);
    });
  }

  /**
   *
   * @param i consist of header value
   * @description adds the header in table
   */
  addCustomHeader(i: any) {
    if (this.displayedColumns.filter(x => x === i).length === 0) {
      this.displayedColumns.push(i);
    } else {
      this.displayedColumns.splice(this.displayedColumns.findIndex(x => x === i), 1);
    }
  }

  logout() {
    this.userService.logout();
  }
}
