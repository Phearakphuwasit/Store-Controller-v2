import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import {
  heroSquares2x2,
  heroCube,
  heroTruck,
  heroClipboardDocumentList,
  heroChartBar,
  heroArrowRightOnRectangle,
  heroQrCode
} from '@ng-icons/heroicons/outline';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    provideIcons({
      heroSquares2x2,
      heroCube,
      heroTruck,
      heroClipboardDocumentList,
      heroChartBar,
      heroArrowRightOnRectangle,
      heroQrCode
    })
  ]
};
