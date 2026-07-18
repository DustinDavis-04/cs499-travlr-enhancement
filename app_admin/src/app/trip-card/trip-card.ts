import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css'
})
export class TripCardComponent {
  @Input() trip!: Trip;
  @Output() tripDeleted = new EventEmitter<void>();

  constructor(
    private router: Router,
    private tripDataService: TripDataService,
    private authenticationService: AuthenticationService
  ) {}

  public editTrip(): void {
    this.router.navigate(['edit-trip'], {
      queryParams: { tripCode: this.trip.code }
    });
  }

  public deleteTrip(): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this trip?'
    );

    if (!confirmed) {
      return;
    }

    this.tripDataService.deleteTrip(this.trip.code).subscribe({
      next: () => {
        this.tripDeleted.emit();
      },
      error: (error: any) => {
        console.log('Error: ' + error);
      }
    });
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
}