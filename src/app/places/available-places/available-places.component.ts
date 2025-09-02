import { Component, DestroyRef, OnInit, signal } from '@angular/core';

import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesService } from "../places.service";
import { Place } from "../place.model";

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('')

  constructor(
    private  placesService: PlacesService,
    private destroyRef: DestroyRef,

  ) {
  }

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription =
      this.placesService.loadAvailablePlaces()
        .subscribe({
          next: (places) => {
            console.log(places);
            this.places.set(places);
          },
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
      const subscription = this.placesService.addPlaceToUserPlaces(selectedPlace)
        .subscribe({
          next: (resData) => {
            console.log(resData);
          }
        })

      this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
