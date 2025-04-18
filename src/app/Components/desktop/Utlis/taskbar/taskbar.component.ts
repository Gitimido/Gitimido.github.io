import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OpenAppService } from 'src/app/Services/open-app.service';
import { AppsService } from 'src/app/Services/apps.service';
import { IApps } from 'src/app/Interface/IApps';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.scss',
})
export class TaskbarComponent implements OnInit {
  @ViewChild('startMenuRef', { static: true })
  startMenuRef!: ElementRef<HTMLDivElement>;
  @ViewChild('clockRef', { static: true })
  clockRef!: ElementRef<HTMLDivElement>;
  appsList: IApps[] = [];
  openWindows: { [key: string]: HTMLElement } = {};
  windowZIndex = 10;
  openApps: IApps[] = [];

  constructor(
    private openAppService: OpenAppService,
    private appsService: AppsService
  ) {}

  ngOnInit(): void {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    this.appsService.appsList$.subscribe((apps) => {
      this.appsList = apps;
      this.openApps = this.appsList.filter(
        (app) => app.status === 'open' || app.status === 'minimized'
      );
    });

    // Subscribe to the openApp$ observable
    this.openAppService.openApp$.subscribe((appId) => {
      this.handleAppOpen(appId);
    });
  }

  // Handle opening apps
  handleAppOpen(appId: string): void {
    const appIndex = this.appsList.findIndex((app) => app.appId === appId);

    if (appIndex !== -1) {
      // If app is already in openApps list
      const openAppIndex = this.openApps.findIndex(
        (app) => app.appId === appId
      );

      if (openAppIndex !== -1) {
        // App is already open, toggle between minimized and open

        this.appsService.getAppStatus(appId) === 'minimized'
          ? this.appsService.updateStatus(appId, 'open')
          : this.appsService.updateStatus(appId, 'minimized');
      } else {
        const appToOpen = { ...this.appsList[appIndex], status: 'open' };
        this.openApps.push(appToOpen);
      }

      // Update the app status in the main appsList
      this.appsList[appIndex].status =
        this.openApps.find((app) => app.appId === appId)?.status || 'closed';
    }
  }

  // Toggle app window (open or minimize)
  toggleAppWindow(appId: string): void {
    const appIndex = this.openApps.findIndex((app) => app.appId === appId);

    if (appIndex !== -1) {
      // Toggle the status between 'open' and 'minimized'
      this.openApps[appIndex].status =
        this.openApps[appIndex].status === 'open' ? 'minimized' : 'open';

      // Update the status in the main appsList as well
      const mainAppIndex = this.appsList.findIndex(
        (app) => app.appId === appId
      );
      if (mainAppIndex !== -1) {
        this.appsList[mainAppIndex].status = this.openApps[appIndex].status;
      }

      // Notify the service about the status change
      this.openAppService.updateAppStatus(
        appId,
        this.openApps[appIndex].status
      );
    }
  }

  // Start Menu
  toggleStartMenu() {
    const startMenu = this.startMenuRef?.nativeElement;
    if (!startMenu) return;
    startMenu.classList.toggle('active');
  }

  updateClock(): void {
    const now = new Date();
    if (this.clockRef?.nativeElement) {
      const timeString = now.toLocaleTimeString();
      const dateString = now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      this.clockRef.nativeElement.textContent = `${timeString} • ${dateString}`;
    }
  }

  onStartMenuItemClick(appId: string) {
    this.openAppService.openApp(appId); // Emits app ID to the observable
    this.toggleStartMenu(); // Close the start menu after selecting an app
  }
}
