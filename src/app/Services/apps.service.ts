import { Injectable } from '@angular/core';
import { IApps } from '../Interface/IApps';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppsService {
  constructor() {}

  //TODO: remove redundant code with open-app.service.ts

  // Define the initial apps list. (Adding a default status if needed.)
  private initialApps: IApps[] = [
    {
      appId: 'SpaceSphare',
      icon: '3d_rotation',
      name: 'SpaceSphare',
      x: 20,
      y: 20,
      status: 'closed',
    },
    {
      appId: 'AlgorithmicPacMan',
      icon: 'extension', // Material icon name
      name: 'AlgorithmicPacMan',
      x: 20,
      y: 120,
      status: 'closed',
    },
    {
      appId: 'Profile',
      icon: 'account_circle', // Material icon name
      name: 'Profile',
      x: 20,
      y: 220,
      status: 'closed',
    },
    {
      appId: 'SmartSnake',
      icon: 'extension', // Material icon name
      name: 'SmartSnake',
      x: 120,
      y: 20,
      status: 'closed',
    },
  ];
  // Use a BehaviorSubject to hold the apps list
  private appsListSubject = new BehaviorSubject<IApps[]>(this.initialApps);
  appsList$ = this.appsListSubject.asObservable();

  // Return the current apps list as an array
  getApps(): IApps[] {
    return this.appsListSubject.value;
  }

  // Get the status of an app using the BehaviorSubject's current value
  getAppStatus(appId: string): string {
    const app = this.appsListSubject.value.find((app) => app.appId === appId);
    return app ? app.status || 'closed' : 'closed';
  }

  // Update the app's status and emit the updated list
  updateStatus(appId: string, status: string): void {
    const apps = this.appsListSubject.value;
    const appIndex = apps.findIndex((app) => app.appId === appId);
    if (appIndex !== -1) {
      apps[appIndex] = { ...apps[appIndex], status };
      this.appsListSubject.next([...apps]); // Emit a new array instance
    }
  }

  // Add a new app and emit the updated list
  addApp(app: IApps): void {
    const updatedApps = [...this.appsListSubject.value, app];
    this.appsListSubject.next(updatedApps);
  }
}
