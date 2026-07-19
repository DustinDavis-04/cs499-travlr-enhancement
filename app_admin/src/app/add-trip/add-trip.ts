import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-trip.html',
  styleUrl: './add-trip.css'
})
export class AddTrip implements OnInit {
  public addForm!: FormGroup;

  submitted = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripDataService
  ) { }

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      code: [
        '',
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
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const days = this.getNumericValue('days');
    const nights = this.getNumericValue('nights');

    if (days === 0 && nights === 0) {
      this.errorMessage =
        'Enter at least one day or one night for the trip length.';
      return;
    }

    const formValue = this.addForm.getRawValue();

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

    this.tripService.addTrip(tripData).subscribe({
      next: () => {
        this.router.navigate(['']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;

        this.errorMessage =
          error.error?.message ||
          'The trip could not be saved. Please try again.';
      }
    });
  }

  public cancel(): void {
    this.router.navigate(['']);
  }

  public showError(controlName: string): boolean {
    const control = this.addForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || this.submitted)
    );
  }

  private getNumericValue(controlName: string): number {
    const value = this.addForm.get(controlName)?.value;

    if (value === null || value === undefined || value === '') {
      return 0;
    }

    return Number(value);
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

  get f() {
    return this.addForm.controls;
  }
}
