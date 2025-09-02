import { Component, DestroyRef, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs";

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);

  constructor(
    private httpClient: HttpClient,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit(): void {
    const subscription = this.httpClient
      .get<{places: Place[]}>("http://localhost:3000/places", {
        // observe: 'response' // to get full HttpResponse object instead resData
        // observe: 'events' // to get HttpEvent stream then in next function will get multiple events - will be triggered multiple times
      })
      .pipe(
        map((resData) => resData.places)
      )
      .subscribe({
        next: (places) => {
          console.log(places);
          this.places.set(places);
        }
      })

    this.destroyRef.onDestroy(() => subscription.unsubscribe()); //technically not required but is a good practice is to always unsubscribe observables
  }
}
