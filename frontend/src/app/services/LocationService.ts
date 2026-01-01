import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private http: HttpClient) {}

  // Your original code wrapped in a Promise
  getPosition(): Promise<{lat: number, lng: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
      }
      navigator.geolocation.getCurrentPosition(
        resp => resolve({ lat: resp.coords.latitude, lng: resp.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: true } // Better for desktop browsers
      );
    });
  }

  // NEW: Convert those numbers into a City and Country name
  async getAddress(lat: number, lng: number): Promise<{city: string, country: string}> {
    try {
      // Free OpenStreetMap Reverse Geocoding API
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const data: any = await this.http.get(url).toPromise();
      
      return {
        city: data.address.city || data.address.town || data.address.village || 'Unknown City',
        country: data.address.country || 'Unknown Country'
      };
    } catch (error) {
      return { city: 'Unknown', country: 'Unknown' };
    }
  }
}