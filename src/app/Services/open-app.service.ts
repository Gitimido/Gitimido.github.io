import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IAppFrame } from '../Interface/IApps';

@Injectable({
  providedIn: 'root',
})
export class OpenAppService {
  /* Commands / events only –
     no state is stored here any more. */

  private readonly openAppSubject = new Subject<string>();
  /** Emits an app ID when the desktop icon is clicked */
  readonly openApp$: Observable<string> = this.openAppSubject.asObservable();

  private readonly initAppSubject = new Subject<IAppFrame>();
  /** Emits the frame element once the app window mounts */
  readonly initApp$: Observable<IAppFrame> = this.initAppSubject.asObservable();

  constructor() {}

  openApp(appId: string): void {
    this.openAppSubject.next(appId);
  }

  initApp(frame: HTMLElement, appId: string): void {
    this.initAppSubject.next({ frame, appId });
  }
}
