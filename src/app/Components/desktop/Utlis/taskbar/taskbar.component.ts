import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OpenAppService } from 'src/app/Services/open-app.service';
import { AppsService } from 'src/app/Services/apps.service';
import { IApps } from 'src/app/Interface/IApps';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taskbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.scss',
})
export class TaskbarComponent implements OnInit {
  @ViewChild('startMenuRef', { static: true })
  startMenuRef!: ElementRef<HTMLDivElement>;
  @ViewChild('clockRef', { static: true })
  clockRef!: ElementRef<HTMLDivElement>;

  appsList: IApps[] = [];
  openApps: IApps[] = [];

  constructor(
    private openAppService: OpenAppService,
    private appsService: AppsService
  ) {}

  ngOnInit(): void {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    /* Subscribe to the canonical store -----------------------------------*/
    this.appsService.appsList$.subscribe((apps) => {
      this.appsList = apps;
      this.openApps = apps.filter(
        (app) => app.status === 'open' || app.status === 'minimized'
      );
    });

    /* React to “open app” command ----------------------------------------*/
    this.openAppService.openApp$.subscribe((appId) => {
      this.handleAppOpen(appId);
    });
  }

  /*──────────────────────── helper methods ───────────────────────*/

  handleAppOpen(appId: string): void {
    const appIndex = this.appsList.findIndex((app) => app.appId === appId);
    if (appIndex === -1) return;

    const isAlreadyOpen = this.openApps.some((a) => a.appId === appId);

    if (isAlreadyOpen) {
      /* toggle minimise / restore */
      const nextStatus =
        this.appsService.getAppStatus(appId) === 'minimized'
          ? 'open'
          : 'minimized';
      this.appsService.updateStatus(appId, nextStatus);
    } else {
      /* first‑time open */
      this.appsService.updateStatus(appId, 'open');
    }
  }

  toggleAppWindow(appId: string): void {
    const openApp = this.openApps.find((a) => a.appId === appId);
    if (!openApp) return;

    const nextStatus = openApp.status === 'open' ? 'minimized' : 'open';
    this.appsService.updateStatus(appId, nextStatus);
  }

  /* Start‑menu helpers */

  toggleStartMenu() {
    this.startMenuRef.nativeElement.classList.toggle('active');
  }

  onStartMenuItemClick(appId: string) {
    this.openAppService.openApp(appId);
    this.toggleStartMenu();
  }

  /* Clock */

  private updateClock(): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    this.clockRef.nativeElement.textContent = `${timeString} • ${dateString}`;
  }
}
