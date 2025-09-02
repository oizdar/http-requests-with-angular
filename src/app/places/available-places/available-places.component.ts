import { Component, DestroyRef, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from "@angular/common/http";
import { catchError, map, throwError } from "rxjs";

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
    private httpClient: HttpClient,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{places: Place[]}>("http://localhost:3000/places", {
        // observe: 'response' // to get full HttpResponse object instead resData
        // observe: 'events' // to get HttpEvent stream then in next function will get multiple events - will be triggered multiple times
      })
      .pipe(
        map((resData) => resData.places),
        catchError((error) => {
          console.log(error);
          //send to analytics server
          throw new Error("Something went wrong! Please try again later.");
        })
      )
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
    this.httpClient
      .put("http://localhost:3000/user-places", { placeId: selectedPlace.id })
      .subscribe({
        next: (resData) => {
          console.log(resData);
        }
      })
  }
}
