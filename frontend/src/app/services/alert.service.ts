import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  alert$ = this.alertSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.alertSubject.next({ message, type });
  }

  showAlert(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.alertSubject.next({ message, type });
  }
}
