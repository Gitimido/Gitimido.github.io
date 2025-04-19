import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IApps } from '../Interface/IApps';
import { environment } from '../env';
@Injectable({
  providedIn: 'root',
})
export class AppsService {
  /* ──────────────────────────────
     Single source of truth: the app list + status
     ────────────────────────────── */

  /** REST endpoint for fetching the apps */
  private readonly API_URL = environment.workersApi + 'APPS';

  /** Subject holding the current list */
  private readonly appsListSubject = new BehaviorSubject<IApps[]>([]);
  /** Full list – components usually subscribe to this */
  readonly appsList$ = this.appsListSubject.asObservable();

  /** Convenience stream: { appId, status }[] */
  readonly status$ = this.appsList$.pipe(
    map((apps) => apps.map((a) => ({ appId: a.appId, status: a.status })))
  );

  constructor(private http: HttpClient) {
    this.fetchApps();
  }

  /**
   * Fetches data from the configured API and populates the subject
   */
  private fetchApps(): void {
    this.http.get<IApps[]>(this.API_URL).subscribe({
      next: (apps) => this.appsListSubject.next(apps),
      error: (err: HttpErrorResponse) => {
        console.error('Error loading apps:', err.message);
      },
    });
  }

  /* ─────────────── getters ─────────────── */

  /** Synchronous snapshot of current apps list */
  getApps(): IApps[] {
    return this.appsListSubject.value;
  }

  /** Retrieves the status of a specific app */
  getAppStatus(appId: string): string {
    return (
      this.appsListSubject.value.find((a) => a.appId === appId)?.status ??
      'closed'
    );
  }

  /* ─────────────── mutators ─────────────── */

  /** Updates status locally */
  updateStatus(appId: string, status: string): void {
    const apps = [...this.appsListSubject.value];
    const i = apps.findIndex((a) => a.appId === appId);
    if (i !== -1) {
      apps[i] = { ...apps[i], status };
      this.appsListSubject.next(apps);
    }
  }

  /** Adds a new app locally */
  addApp(app: IApps): void {
    this.appsListSubject.next([...this.appsListSubject.value, app]);
  }
}
