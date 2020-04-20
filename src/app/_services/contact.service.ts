import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';

interface Contact {
  _id: string;
  name: string;
  companyname: string;
  email: string;
  mobile: number;
  address: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})

export class ContactService {

  constructor(public http: HttpClient) { }

  private contacts = new BehaviorSubject<Contact[]>([]);
  public readonly contactsData: Observable<Contact[]> = this.contacts.asObservable();

  serverUrl = environment.serverUrl;

  addContact(contactData: Contact) {
    return this.http.post<Contact>(this.serverUrl + '/api/contacts', contactData).pipe(
      tap(data => {
        this.contacts.next(this.contacts.getValue().concat(contactData));
      }),
      map(res => res)
    );
  }

  updateContact(contactData: Contact) {
    return this.http.put<Contact>(this.serverUrl + '/api/contacts/' + contactData._id, contactData).pipe(
      tap(data => {
        const tranformedContactData = this.contacts.getValue().filter(info => info._id !== contactData._id);
        this.contacts.next(tranformedContactData.concat(contactData));
      }),
      map(res => res)
    );
  }

  getContacts(sortyBy) {
    return this.http.get<Contact[]>(this.serverUrl + '/api/contacts/' + sortyBy).pipe(
      map(contactData => {
        this.contacts.next(contactData);
        return contactData;
      })
    );
  }

  deleteContact(contactData) {
    return this.http.delete<Contact>(this.serverUrl + '/api/contacts/' + contactData._id).pipe(
      tap(data => {
        console.log(this.contacts.getValue());
        const tranformedContactData = this.contacts.getValue().filter(info => info._id !== contactData._id);
        this.contacts.next(tranformedContactData);
      }),
      map(res => res)
    );
  }

  searchContact(searchValue) {
    return this.http.get<Contact[]>(this.serverUrl + '/api/contacts/search/' + searchValue);
  }

  sendSMS(smsValue) {
    return this.http.post(this.serverUrl + '/api/contacts/sms', smsValue);
  }

  downloadTemplate() {
    return this.http.get(this.serverUrl + '/api/contacts');
  }

  uploadContact(fileInput) {
    return this.http.post(this.serverUrl + '/api/contacts/upload/contact', fileInput)
      .pipe(tap((data: any) => {
        this.contacts.next(this.contacts.getValue().concat(data));
      }),
        map(res => res));
  }

  getCustomizeHeader() {
    return this.http.get(this.serverUrl + '/api/contacts/get/customize/header').pipe(
      map(res => res)
    );
  }
}
