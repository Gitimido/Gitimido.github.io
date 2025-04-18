import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bootup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bootup.component.html',
  styleUrls: ['./bootup.component.scss'],
})
export class BootupComponent implements OnInit {
  @Output() bootupComplete = new EventEmitter<boolean>();

  startAnimationComplete = false;
  showStartButton = false;
  loadingProgress = 0;
  currentStatusMessage = 'Initializing systems...';

  private statusMessages = [
    'Initializing systems...',
    'Loading resources...',
    'Preparing interface...',
    'Optimizing performance...',
    'System Ready',
  ];

  ngOnInit() {
    // Simulate loading progress
    this.simulateLoading();
  }

  simulateLoading() {
    let progress = 0;
    let messageIndex = 0;

    // Faster initial progress
    const interval = setInterval(() => {
      // Calculate a dynamic increment that slows down as we approach 100%
      let increment = 0;

      if (progress < 70) {
        increment = Math.floor(Math.random() * 5) + 2; // Faster at beginning
      } else if (progress < 90) {
        increment = Math.floor(Math.random() * 3) + 1; // Slower in middle
      } else {
        increment = 1; // Very slow at end
      }

      progress += increment;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.currentStatusMessage = 'System Ready';

        // Add a class to the status message element when it's ready
        const statusElement = document.querySelector('.status-message');
        if (statusElement) {
          statusElement.classList.add('ready');
        }

        // Show the start button with a small delay
        setTimeout(() => {
          this.showStartButton = true;
        }, 500);
      }

      // Update progress
      this.loadingProgress = progress;

      // Update message based on progress milestones
      if (
        progress > messageIndex * 20 &&
        messageIndex < this.statusMessages.length - 1
      ) {
        messageIndex++;
        this.currentStatusMessage = this.statusMessages[messageIndex];
      }
    }, 120);
  }

  startDesktop() {
    this.startAnimationComplete = true;

    // Emit event after fade-out animation completes
    setTimeout(() => {
      this.bootupComplete.emit(true);
    }, 800);
  }
}
