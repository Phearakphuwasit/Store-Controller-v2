import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
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