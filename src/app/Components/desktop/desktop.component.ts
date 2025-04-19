import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TaskbarComponent } from './Utlis/taskbar/taskbar.component';
import { OpenAppService } from 'src/app/Services/open-app.service';
import { FrameComponent } from './Utlis/frame/frame.component';
import { AppsService } from 'src/app/Services/apps.service';
import { IApps } from 'src/app/Interface/IApps';

@Component({
  selector: 'app-desktop',
  standalone: true,
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [TaskbarComponent, FrameComponent],
})
export class DesktopComponent implements OnInit {
  /* ───────────────── DOM refs ───────────────── */
  @ViewChild('desktopRef', { static: true })
  desktopRef!: ElementRef<HTMLDivElement>;

  /* ───────────────── runtime state ───────────── */
  openWindows: Record<string, HTMLElement> = {};
  windowZIndex = 10;

  windowSizes: Record<string, { width: number; height: number }> = {};

  /* icon drag */
  isDragging = false;
  currentDragElement: HTMLElement | null = null;
  offsetX = 0;
  offsetY = 0;

  /* default window position */
  defaultLeft = 300;
  defaultTop = 50;

  /* cache to avoid reacting to unchanged status values */
  private statusCache: Record<string, string> = {};

  constructor(private bus: OpenAppService, private _appsService: AppsService) {}

  /* ───────────────────────── lifecycle ───────────────────────── */

  ngOnInit(): void {
    /* build desktop icons */
    this._appsService.appsList$.subscribe((apps: IApps[]) =>
      apps.forEach((app) => this.createAppIcon(app))
    );

    /* react to “openApp” commands from taskbar / start menu */
    this.bus.openApp$.subscribe((appId) => this.openApp(appId));

    /* react to status changes in the single source‑of‑truth store */
    this._appsService.status$.subscribe((list) => {
      list.forEach(({ appId, status }) => {
        if (this.statusCache[appId] === status) return; // unchanged
        this.statusCache[appId] = status!;

        switch (status) {
          case 'open':
            if (!this.openWindows[appId]) this.openApp(appId);
            else this.bringToFront(this.openWindows[appId]);
            break;

          case 'minimized':
            this.openWindows[appId]?.style.setProperty('display', 'none');
            break;

          case 'closed':
            this.closeWindow(appId);
            break;
        }
      });
    });
  }

  /* ───────────────────────── icon handling ───────────────────── */

  private createAppIcon(app: IApps): void {
    const { appId, icon, name, x, y } = app;

    const iconEl = document.createElement('div');
    iconEl.className = 'app-icon';
    iconEl.id = `${appId}-icon`;
    iconEl.style.left = `${x}px`;
    iconEl.style.top = `${y}px`;
    iconEl.setAttribute('data-app', appId);

    /* bigger hit‑area */
    iconEl.style.width = '80px';
    iconEl.style.height = '80px';

    /* visual part */
    const iconImg = document.createElement('div');
    iconImg.className = 'app-icon-img';
    iconImg.style.width = '60px';
    iconImg.style.height = '60px';

    const matIcon = document.createElement('span');
    matIcon.className = 'material-icons';
    matIcon.textContent = icon;
    matIcon.style.fontSize = '36px';

    iconImg.appendChild(matIcon);

    const iconText = document.createElement('div');
    iconText.className = 'app-icon-text';
    iconText.textContent = name;
    iconText.style.fontSize = '14px';

    iconEl.appendChild(iconImg);
    iconEl.appendChild(iconText);
    this.desktopRef.nativeElement.appendChild(iconEl);

    /* events */
    iconEl.addEventListener('dblclick', () => this.openApp(appId));
    iconEl.addEventListener('mousedown', (e) => this.startDrag(e));
  }

  /* ───────────────────────── open / window helpers ───────────── */

  public openApp(appId: string): void {
    if (this.openWindows[appId]) {
      /* already exists → just restore / bring to front */
      this._appsService.updateStatus(appId, 'open');
      this.bringToFront(this.openWindows[appId]);
      return;
    }

    /* first‑time open */
    const windowEl = this.createWindow(appId);
    this.bus.initApp(windowEl, appId); // still emit init event
    this._appsService.updateStatus(appId, 'open');
  }

  private createWindow(appId: string): HTMLElement {
    const desktopEl = this.desktopRef.nativeElement;

    const windowEl = document.createElement('div');
    windowEl.className = `app-window ${appId}-app`;
    windowEl.id = `${appId}-window`;
    windowEl.style.zIndex = (this.windowZIndex++).toString();
    windowEl.style.left = `${this.defaultLeft}px`;
    windowEl.style.top = `${this.defaultTop}px`;

    /* ───── title bar ───── */
    const titleBar = document.createElement('div');
    titleBar.className = 'window-title';
    titleBar.innerHTML = `
      <div>${appId || 'Untitled App'}</div>
      <div class="window-controls">
        <div class="window-control minimize"></div>
        <div class="window-control maximize"></div>
        <div class="window-control close"></div>
      </div>
    `;

    const contentEl = document.createElement('div');
    contentEl.className = 'window-content';

    windowEl.appendChild(titleBar);
    windowEl.appendChild(contentEl);
    desktopEl.appendChild(windowEl);

    /* focus / z‑index */
    windowEl.addEventListener('mousedown', () => this.bringToFront(windowEl));

    /* drag window */
    titleBar.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains('window-title') ||
        target.closest('.window-title')
      ) {
        this.startWindowDrag(e, windowEl);
      }
    });

    /* maximise / restore */
    titleBar.addEventListener('dblclick', () =>
      this.toggleMaximize(windowEl, appId)
    );

    /* window controls */
    const closeBtn = titleBar.querySelector('.close') as HTMLElement;
    const minBtn = titleBar.querySelector('.minimize') as HTMLElement;
    const maxBtn = titleBar.querySelector('.maximize') as HTMLElement;

    closeBtn.addEventListener('click', () => {
      this.closeWindow(appId);
      this._appsService.updateStatus(appId, 'closed');
    });

    minBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
      this._appsService.updateStatus(appId, 'minimized');
    });

    maxBtn.addEventListener('click', () =>
      this.toggleMaximize(windowEl, appId)
    );

    /* resize handles */
    const directions = [
      'top',
      'right',
      'bottom',
      'left',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ];
    directions.forEach((dir) => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', dir);
      windowEl.appendChild(handle);
      handle.addEventListener('mousedown', (e) =>
        this.startWindowResize(e, windowEl, appId, dir)
      );
    });

    /* remember default size */
    this.windowSizes[appId] = {
      width: windowEl.offsetWidth,
      height: windowEl.offsetHeight,
    };
    this.openWindows[appId] = windowEl;

    return windowEl;
  }

  private bringToFront(windowEl: HTMLElement): void {
    windowEl.style.zIndex = (this.windowZIndex++).toString();
    if (windowEl.style.display === 'none') {
      windowEl.style.display = 'flex';
    }
  }

  private closeWindow(appId: string): void {
    const windowEl = document.getElementById(`${appId}-window`);
    if (windowEl) {
      windowEl.remove();
      delete this.openWindows[appId];
    }
  }

  /* ───────────────────────── maximise / restore ──────────────── */

  private toggleMaximize(windowEl: HTMLElement, appId: string): void {
    if (windowEl.style.width === '100%') {
      /* restore */
      const saved = this.windowSizes[appId];
      if (saved) {
        windowEl.style.width = `${saved.width}px`;
        windowEl.style.height = `${saved.height}px`;
      } else {
        windowEl.style.width = '1100px';
        windowEl.style.height = '500px';
      }
      windowEl.style.top = `${this.defaultTop}px`;
      windowEl.style.left = `${this.defaultLeft}px`;
      windowEl.querySelector('.maximize')?.classList.remove('maximized');
    } else {
      /* save current size then maximise */
      this.windowSizes[appId] = {
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight,
      };
      windowEl.style.width = '100%';
      windowEl.style.height = 'calc(100% - 15px)';
      windowEl.style.top = '0';
      windowEl.style.left = '0';
      windowEl.querySelector('.maximize')?.classList.add('maximized');
    }
  }

  /* ───────────────────────── ICON DRAG ───────────────────────── */

  private startDrag(event: MouseEvent): void {
    const icon = (event.currentTarget as HTMLElement).closest(
      '.app-icon'
    ) as HTMLElement;
    if (!icon) return;
    this.isDragging = true;
    this.currentDragElement = icon;

    const rect = icon.getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;

    icon.style.zIndex = '2';
    event.preventDefault();
  }

  @HostListener('document:mouseup')
  private stopDrag(): void {
    if (this.isDragging && this.currentDragElement) {
      this.currentDragElement.style.zIndex = '1';
      this.isDragging = false;
      this.currentDragElement = null;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  private drag(event: MouseEvent): void {
    if (!this.isDragging || !this.currentDragElement) return;

    const x = event.clientX - this.offsetX;
    const y = event.clientY - this.offsetY;
    this.currentDragElement.style.left = `${x}px`;
    this.currentDragElement.style.top = `${y}px`;

    const appId = this.currentDragElement.getAttribute('data-app');
    if (appId) {
      /* Persist position if you need it later */
    }
  }

  /* ───────────────────────── WINDOW DRAG ─────────────────────── */

  private startWindowDrag(event: MouseEvent, windowEl: HTMLElement): void {
    event.preventDefault();
    const initialX = event.clientX;
    const initialY = event.clientY;
    const initialWindowX = windowEl.offsetLeft;
    const initialWindowY = windowEl.offsetTop;

    const onMove = (move: MouseEvent) => {
      windowEl.style.left = `${initialWindowX + (move.clientX - initialX)}px`;
      windowEl.style.top = `${initialWindowY + (move.clientY - initialY)}px`;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /* ───────────────────────── WINDOW RESIZE ───────────────────── */

  private startWindowResize(
    event: MouseEvent,
    windowEl: HTMLElement,
    appId: string,
    direction: string
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const initialX = event.clientX;
    const initialY = event.clientY;
    const initialWidth = windowEl.offsetWidth;
    const initialHeight = windowEl.offsetHeight;
    const initialLeft = windowEl.offsetLeft;
    const initialTop = windowEl.offsetTop;

    const onMove = (move: MouseEvent) => {
      let dx = move.clientX - initialX;
      let dy = move.clientY - initialY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = initialLeft;
      let newTop = initialTop;

      if (direction.includes('right')) newWidth = initialWidth + dx;
      if (direction.includes('left')) {
        newWidth = Math.max(initialWidth - dx, 0);
        newLeft = initialLeft + (initialWidth - newWidth);
      }
      if (direction.includes('bottom')) newHeight = initialHeight + dy;
      if (direction.includes('top')) {
        newHeight = initialHeight - dy;
        newTop = initialTop + dy;
      }

      windowEl.style.width = `${newWidth}px`;
      windowEl.style.height = `${newHeight}px`;
      windowEl.style.left = `${newLeft}px`;
      windowEl.style.top = `${newTop}px`;

      this.windowSizes[appId] = { width: newWidth, height: newHeight };
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
}
