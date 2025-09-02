import { Component, DestroyRef, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from "../place.model";
import { PlacesService } from "../places.service";

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
  places = this.placesService.loadedUserPlaces;
  isFetching = signal(false);
  error = signal('')

  constructor(
    private placesService: PlacesService,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces()
      .subscribe({
        complete: () => {
          this.isFetching.set(false)
        },
        error: (error) => {
          this.error.set(error.message);
          this.isFetching.set(false)
        }
      })

    this.destroyRef.onDestroy(() => subscription.unsubscribe()); //technically not required but is a good practice is to always unsubscribe observables
  }

  onSelectPlace(selectedPlace: Place) {
    const subscription = this.placesService.removeUserPlace(selectedPlace)
      .subscribe({
        next: (resData) => {
          console.log(resData);
        }
      })

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
