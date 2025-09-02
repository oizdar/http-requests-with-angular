import { Component, DestroyRef, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from "../place.model";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs";

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
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
      .get<{places: Place[]}>("http://localhost:3000/user-places", {
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
}
