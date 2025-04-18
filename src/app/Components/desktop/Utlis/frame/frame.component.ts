import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OpenAppService } from 'src/app/Services/open-app.service';
import { environment } from 'src/app/env';

@Component({
  selector: 'app-frame',
  standalone: true,
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss'],
})
export class FrameComponent implements OnInit, OnDestroy {
  private initAppSubscription!: Subscription;

  constructor(private openAppService: OpenAppService) {}

  ngOnInit(): void {
    // Listen for "initApp$" from your Desktop:
    this.initAppSubscription = this.openAppService.initApp$.subscribe(
      (appFrame) => {
        // Use the environment-based URL or anything you want
        if (appFrame.appId === 'Profile') {
          this.initIframeApp(appFrame.frame, `${environment.profile}`);
        } else {
          this.initIframeApp(
            appFrame.frame,
            `${environment.workersApi}${appFrame.appId}`
          );
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.initAppSubscription) {
      this.initAppSubscription.unsubscribe();
    }
  }

  initIframeApp(windowEl: HTMLElement, url: string): void {
    const contentEl = windowEl.querySelector('.window-content');
    if (!contentEl) return;

    // Set CSS styles for the contentEl
    const htmlContentEl = contentEl as HTMLElement;
    htmlContentEl.style.padding = '0';
    htmlContentEl.style.margin = '0';
    htmlContentEl.style.overflow = 'hidden';
    htmlContentEl.style.position = 'relative';

    // Enhanced loading UI using a class instead of an id
    contentEl.innerHTML = `
      <div class="app-loading" style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; justify-content:center; align-items:center; background:#0f172a; z-index:10;">
        <div class="loading-spinner" style="position:relative; width:40px; height:40px;">
          <div style="position:absolute; inset:0; border:3px solid transparent; border-top-color:#a855f7; border-radius:50%; animation:spin 1s linear infinite;"></div>
          <div style="position:absolute; inset:6px; border:3px solid transparent; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.8s linear infinite reverse;"></div>
          <div style="position:absolute; inset:12px; border:3px solid transparent; border-top-color:#d946ef; border-radius:50%; animation:spin 0.6s linear infinite;"></div>
        </div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fade {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        </style>
      </div>
      <iframe src="${url}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; margin:0; padding:0; display:block; box-sizing:border-box;" onload="this.parentNode.querySelector('.app-loading').style.display='none';"></iframe>
    `;
  }
}
