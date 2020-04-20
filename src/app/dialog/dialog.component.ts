import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ContactService } from '../_services/contact.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  contact: any = {};
  type: any;
  smstext: any;

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog,
    // tslint:disable-next-line: align
    public contactService: ContactService) { }

  ngOnInit() {
    if (this.data.contactData) { this.contact = this.data.contactData; this.type = 'edit'; }
  }

  onNoClick() {
    this.dialogRef.close('no');
  }

  /**
   *
   * @param formValue consists of form values
   */
  onSubmit(formValue) {
    if (formValue.valid) {
      if (this.contact._id) {
        this.contactService.updateContact(this.contact).subscribe(() => {
          this.dialogRef.close('yes');
        });
      } else {
        this.contactService.addContact(this.contact).subscribe(() => {
          this.dialogRef.close('yes');
        });
      }
    }
  }

  senndSms(smsValue) {
    if (smsValue.valid) {
      this.dialogRef.close(smsValue.value);
    }
  }
}
