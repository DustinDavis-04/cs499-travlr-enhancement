import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TripDataService } from '../services/trip-data';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-trip.html',
  styleUrl: './edit-trip.css'
})
export class EditTrip implements OnInit {
  public editForm!: FormGroup;

  trip!: Trip;
  submitted = false;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  private originalTripCode = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tripDataService: TripDataService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const tripCode = this.route.snapshot.queryParamMap.get('tripCode');

    if (!tripCode) {
      this.errorMessage = 'The trip code could not be found.';
      this.isLoading = false;
      return;
    }

    this.originalTripCode = tripCode;

    this.editForm = this.formBuilder.group({
      code: [
        tripCode,
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/^[A-Za-z0-9-]+$/)
        ]
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],
      days: [
        '',
        [
          Validators.pattern(/^\d{0,2}$/),
          Validators.min(0),
          Validators.max(99)
        ]
      ],
      nights: [
        '',
        [
          Validators.pattern(/^\d{0,2}$/),
          Validators.min(0),
          Validators.max(99)
        ]
      ],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+(\.\d{1,2})?$/)
        ]
      ],
      image: ['', Validators.required],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ]
    });

    this.loadTrip(tripCode);
  }

  private loadTrip(tripCode: string): void {
    this.tripDataService.getTrip(tripCode).subscribe({
      next: (retrievedTrip: Trip) => {
        try {
          if (!retrievedTrip) {
            this.errorMessage =
              `No trip was found with code ${tripCode}.`;
            return;
          }

          this.trip = retrievedTrip;

          const lengthValues = this.parseTripLength(
            String(retrievedTrip.length || '')
          );

          this.editForm.patchValue({
            code: retrievedTrip.code || '',
            name: retrievedTrip.name || '',
            days: lengthValues.days || '',
            nights: lengthValues.nights || '',
            start: this.formatDateForInput(
              String(retrievedTrip.start || '')
            ),
            resort: retrievedTrip.resort || '',
            perPerson: retrievedTrip.perPerson || '',
            image: retrievedTrip.image || '',
            description: retrievedTrip.description || ''
          });
        } catch (error) {
          console.error('Unable to populate the edit form:', error);

          this.errorMessage =
            'The trip was retrieved, but its information could not be displayed.';
        } finally {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Unable to retrieve trip:', error);

        this.errorMessage =
          error.error?.message ||
          'The trip could not be loaded. Please try again.';

        this.isLoading = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const days = this.getNumericValue('days');
    const nights = this.getNumericValue('nights');

    if (days === 0 && nights === 0) {
      this.errorMessage =
        'Enter at least one day or one night for the trip length.';
      return;
    }

    const formValue = this.editForm.getRawValue();

    const tripData = {
      code: formValue.code.trim(),
      name: formValue.name.trim(),
      length: this.buildTripLength(days, nights),
      start: formValue.start,
      resort: formValue.resort.trim(),
      perPerson: String(formValue.perPerson).trim(),
      image: formValue.image.trim(),
      description: formValue.description.trim()
    };

    this.isSubmitting = true;

    this.tripDataService.updateTrip(tripData).subscribe({
      next: () => {
        this.router.navigate(['']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;

        this.errorMessage =
          error.error?.message ||
          'The trip could not be updated. Please try again.';

        this.changeDetector.detectChanges();
      }
    });
  }

  public cancel(): void {
    this.router.navigate(['']);
  }

  public showError(controlName: string): boolean {
    const control = this.editForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || this.submitted)
    );
  }

  private getNumericValue(controlName: string): number {
    const value = this.editForm.get(controlName)?.value;

    if (value === null || value === undefined || value === '') {
      return 0;
    }

    return Number(value);
  }

  private parseTripLength(length: string): {
    days: number;
    nights: number;
  } {
    const dayMatch = length.match(/(\d{1,2})\s*days?/i);
    const nightMatch = length.match(/(\d{1,2})\s*nights?/i);

    return {
      days: dayMatch ? Number(dayMatch[1]) : 0,
      nights: nightMatch ? Number(nightMatch[1]) : 0
    };
  }

  private buildTripLength(days: number, nights: number): string {
    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }

    if (nights > 0) {
      parts.push(`${nights} ${nights === 1 ? 'night' : 'nights'}`);
    }

    return parts.join(', ');
  }

  private formatDateForInput(dateValue: string): string {
    if (!dateValue) {
      return '';
    }

    const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}/);

    return dateMatch ? dateMatch[0] : '';
  }

  get f() {
    return this.editForm.controls;
  }
}
