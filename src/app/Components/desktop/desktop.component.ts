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
  @ViewChild('desktopRef', { static: true })
  desktopRef!: ElementRef<HTMLDivElement>;
  @ViewChild('startMenuRef', { static: true })
  startMenuRef!: ElementRef<HTMLDivElement>;
  @ViewChild('clockRef', { static: true })
  clockRef!: ElementRef<HTMLDivElement>;

  openWindows: { [key: string]: HTMLElement } = {};
  windowZIndex = 10;
  // Object to store window dimensions for later use
  windowSizes: { [key: string]: { width: number; height: number } } = {};

  isDragging = false;
  currentDragElement: HTMLElement | null = null;
  offsetX = 0;
  offsetY = 0;
  defaultLeft = 300;
  defaultTop = 50;

  appPositions: { [key: string]: { x: number; y: number } } = {};
  appsList: IApps[] = [];
  constructor(
    private openAppService: OpenAppService,
    private appService: AppsService
  ) {}

  ngOnInit(): void {
    this.appService.getApps().forEach((app: IApps) => {
      this.createAppIcon(app);
    });

    this.appsList = this.appService.getApps();

    this.openAppService.openApp$.subscribe((appId) => {
      this.openApp(appId);
    });

    this.openAppService.appStatus$.subscribe((app) => {
      app.status === 'open' && this.openApp(app.appId);
    });

    this.openAppService.appStatus$.subscribe((app) => {
      if (app.status === 'minimized') {
        const windowEl = this.openWindows[app.appId];
        if (windowEl) {
          windowEl.style.display = 'none';
        }
      }
    });
  }
  createAppIcon(app: IApps): void {
    const { appId, icon, name, x, y } = app;
    // The outer icon container
    const iconEl = document.createElement('div');
    iconEl.className = 'app-icon';
    iconEl.id = `${appId}-icon`;
    iconEl.style.left = `${x}px`;
    iconEl.style.top = `${y}px`;
    iconEl.setAttribute('data-app', appId);

    // Make the icon container bigger
    iconEl.style.width = '80px'; // Increase from default
    iconEl.style.height = '80px'; // Increase from default

    // The "image" container (same as you used for the emoji)
    const iconImg = document.createElement('div');
    iconImg.className = 'app-icon-img';

    // Adjust the size of the image container
    iconImg.style.width = '60px'; // Increase from default
    iconImg.style.height = '60px'; // Increase from default

    // Create the actual Material icon element
    const matIcon = document.createElement('span');
    matIcon.className = 'material-icons';
    matIcon.textContent = icon; // e.g. 'rocket_launch'

    // Make the Material Icons font size bigger
    matIcon.style.fontSize = '36px'; // Increase from default

    // Append the Material icon into the iconImg container
    iconImg.appendChild(matIcon);

    // Create the text label
    const iconText = document.createElement('div');
    iconText.className = 'app-icon-text';
    iconText.textContent = name;

    // Adjust text size if needed
    iconText.style.fontSize = '14px'; // Adjust as needed

    // Append everything
    iconEl.appendChild(iconImg);
    iconEl.appendChild(iconText);
    this.desktopRef.nativeElement.appendChild(iconEl);

    // Events for opening/draggng
    iconEl.addEventListener('dblclick', () => this.openApp(appId));
    iconEl.addEventListener('mousedown', (e) => this.startDrag(e));
  }

  public openApp(appId: string): void {
    if (this.openWindows[appId]) {
      this.openAppService.updateAppStatus(appId, 'open');
      this.appService.updateStatus(appId, 'open');

      this.bringToFront(this.openWindows[appId]);
      return;
    }
    const windowEl = this.createWindow(appId);

    this.openAppService.initApp(windowEl, appId);
  }
  createWindow(appId: string): HTMLElement {
    const desktopEl = this.desktopRef.nativeElement;
    const windowEl = document.createElement('div');
    windowEl.className = `app-window ${appId}-app`;
    windowEl.id = `${appId}-window`;
    windowEl.style.zIndex = (this.windowZIndex++).toString();
    windowEl.style.left = `${this.defaultLeft}px`;
    windowEl.style.top = `${this.defaultTop}px`;

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

    windowEl.addEventListener('mousedown', () => this.bringToFront(windowEl));

    // Window drag functionality
    titleBar.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains('window-title') ||
        target.closest('.window-title')
      ) {
        this.startWindowDrag(e, windowEl);
      }
    });

    // Double-click to maximize/restore
    titleBar.addEventListener('dblclick', () => {
      this.toggleMaximize(windowEl, appId);
    });

    const closeBtn = titleBar.querySelector('.close') as HTMLElement;
    closeBtn.addEventListener('click', () => {
      this.closeWindow(appId);
      this.openAppService.updateAppStatus(appId, 'closed');
      this.appService.updateStatus(appId, 'closed');
    });

    const minBtn = titleBar.querySelector('.minimize') as HTMLElement;
    minBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
      this.openAppService.updateAppStatus(appId, 'minimized');
      this.appService.updateStatus(appId, 'minimized');
    });

    const maxBtn = titleBar.querySelector('.maximize') as HTMLElement;
    maxBtn.addEventListener('click', () => {
      this.toggleMaximize(windowEl, appId);
    });

    // --- Add resize handles for all edges/corners ---
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
      // The CSS will position these handles correctly.
      windowEl.appendChild(handle);
      handle.addEventListener('mousedown', (e) =>
        this.startWindowResize(e, windowEl, appId, dir)
      );
    });

    // Store the initial window dimensions
    this.windowSizes[appId] = {
      width: windowEl.offsetWidth,
      height: windowEl.offsetHeight,
    };
    this.openWindows[appId] = windowEl;

    return windowEl;
  }

  // Add this new helper method to handle maximize/restore toggle
  toggleMaximize(windowEl: HTMLElement, appId: string): void {
    if (windowEl.style.width === '100%') {
      // Restore
      if (this.windowSizes[appId]) {
        // Restore to saved size if available
        windowEl.style.width = `${this.windowSizes[appId].width}px`;
        windowEl.style.height = `${this.windowSizes[appId].height}px`;
      } else {
        // Default size if no saved size
        windowEl.style.width = '1100px';
        windowEl.style.height = '500px';
      }
      windowEl.style.top = `${this.defaultTop}px`;
      windowEl.style.left = `${this.defaultLeft}px`;

      // Update maximize button to show "maximize" icon if you have specific classes for this
      const maxBtn = windowEl.querySelector('.maximize') as HTMLElement;
      if (maxBtn) {
        maxBtn.classList.remove('maximized');
      }
    } else {
      // Save current window size before maximizing
      this.windowSizes[appId] = {
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight,
      };

      // Maximize
      windowEl.style.width = '100%';
      windowEl.style.height = 'calc(100% - 15px)';
      windowEl.style.top = '0';
      windowEl.style.left = '0';

      // Update maximize button to show "restore" icon if you have specific classes for this
      const maxBtn = windowEl.querySelector('.maximize') as HTMLElement;
      if (maxBtn) {
        maxBtn.classList.add('maximized');
      }
    }
  }

  bringToFront(windowEl: HTMLElement): void {
    windowEl.style.zIndex = (this.windowZIndex++).toString();
    if (windowEl.style.display === 'none') {
      windowEl.style.display = 'flex';
    }
  }

  closeWindow(appId: string): void {
    const windowEl = document.getElementById(`${appId}-window`);
    if (windowEl) {
      windowEl.remove();
      delete this.openWindows[appId];
    }
  }

  // DRAG ICONS
  startDrag(event: MouseEvent): void {
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

  @HostListener('document:mouseup', ['$event'])
  stopDrag(): void {
    if (this.isDragging && this.currentDragElement) {
      this.currentDragElement.style.zIndex = '1';
      this.isDragging = false;
      this.currentDragElement = null;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  drag(event: MouseEvent): void {
    if (!this.isDragging || !this.currentDragElement) return;
    const x = event.clientX - this.offsetX;
    const y = event.clientY - this.offsetY;
    this.currentDragElement.style.left = `${x}px`;
    this.currentDragElement.style.top = `${y}px`;
    const appId = this.currentDragElement.getAttribute('data-app');
    if (appId) {
      this.appPositions[appId] = { x, y };
    }
  }

  // DRAG WINDOW (move entire window)
  startWindowDrag(event: MouseEvent, windowEl: HTMLElement): void {
    event.preventDefault();
    const initialX = event.clientX;
    const initialY = event.clientY;
    const initialWindowX = windowEl.offsetLeft;
    const initialWindowY = windowEl.offsetTop;
    const onDragMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - initialX;
      const dy = moveEvent.clientY - initialY;
      windowEl.style.left = `${initialWindowX + dx}px`;
      windowEl.style.top = `${initialWindowY + dy}px`;
    };
    const onDragEnd = () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }

  startWindowResize(
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

    const onMouseMove = (moveEvent: MouseEvent) => {
      let dx = moveEvent.clientX - initialX;
      let dy = moveEvent.clientY - initialY;
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = initialLeft;
      let newTop = initialTop;

      if (direction.includes('right')) {
        newWidth = initialWidth + dx;
      }
      if (direction.includes('left')) {
        newWidth = Math.max(initialWidth - dx, 0);
        newLeft = initialLeft + (initialWidth - newWidth);
      }
      if (direction.includes('bottom')) {
        newHeight = initialHeight + dy;
      }
      if (direction.includes('top')) {
        newHeight = initialHeight - dy;
        newTop = initialTop + dy;
      }

      windowEl.style.width = newWidth + 'px';
      windowEl.style.height = newHeight + 'px';
      windowEl.style.left = newLeft + 'px';
      windowEl.style.top = newTop + 'px';

      this.windowSizes[appId] = { width: newWidth, height: newHeight };
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
