import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopComponent } from './Components/desktop/desktop.component';
import { BootupComponent } from './Components/desktop/Utlis/bootup/bootup.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DesktopComponent, BootupComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Mohamed Hazem';
  bootupComplete = false;

  constructor() {}

  onBootupComplete(): void {
    this.bootupComplete = true;
  }
}
