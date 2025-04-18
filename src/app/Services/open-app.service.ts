import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IAppFrame } from '../Interface/IApps';

@Injectable({
  providedIn: 'root',
})
export class OpenAppService {
  private openAppSubject = new Subject<string>(); // Observable stream
  openApp$: Observable<string> = this.openAppSubject.asObservable(); // Public observable
  private initAppSubject = new Subject<IAppFrame>(); // Observable stream
  initApp$: Observable<IAppFrame> = this.initAppSubject.asObservable(); // Public observable
  private appStatusSource = new Subject<{ appId: string; status: string }>();
  appStatus$ = this.appStatusSource.asObservable();
  constructor() {}

  /** Emits an app ID to notify listeners (e.g., DesktopComponent) */
  openApp(appId: string) {
    this.openAppSubject.next(appId); // Push value to subscribers
  }

  /** Initializes the app (if needed, can be extended later) */
  initApp(appFrame: HTMLElement, appName: string) {
    this.initAppSubject.next({ frame: appFrame, appId: appName });
  }

  updateAppStatus(appId: string, status: string) {
    this.appStatusSource.next({ appId, status });
  }
}
