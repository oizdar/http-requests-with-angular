import { Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from "@angular/common/http";
import { catchError, map, tap } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  private backendUrl = 'http://localhost:3000';

  loadedUserPlaces = this.userPlaces.asReadonly();

  constructor(private httpClient: HttpClient) {}
  loadAvailablePlaces() {
    return this.fetchPlaces('/places');
  }

  loadUserPlaces() {
    return this.fetchPlaces('/user-places')
      .pipe(tap({
        next: (places) => {
          this.userPlaces.set(places);
        }
      }));
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();
    if(!prevPlaces.some(p => p.id === place.id)) {
      this.userPlaces.update(prevPlaces => [...prevPlaces, place]);
    }

    return this.httpClient
      .put(this.backendUrl + '/user-places', { placeId: place.id })
      .pipe(catchError((error) => {
        console.log(error);
        //send to analytics server
        this.userPlaces.set(prevPlaces)
        throw new Error("Something went wrong! Please try again later.");
      }));
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(uri: string) {
    return this.httpClient
      .get<{places: Place[]}>(this.backendUrl + uri, {
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
  }
}
