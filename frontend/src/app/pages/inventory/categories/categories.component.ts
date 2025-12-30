import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
// Import the specific icons you used in your redesign
import { 
  heroXMark, 
  heroPhoto, 
  heroPlus, 
  heroMagnifyingGlass, 
  heroFolder, 
  heroCheckCircle, 
  heroArchiveBox, 
  heroPencilSquare, 
  heroTrash, 
  heroAdjustmentsHorizontal 
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({ 
      heroXMark, 
      heroPhoto, 
      heroPlus, 
      heroMagnifyingGlass, 
      heroFolder, 
      heroCheckCircle, 
      heroArchiveBox, 
      heroPencilSquare, 
      heroTrash, 
      heroAdjustmentsHorizontal 
    })
  ],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent {
  // Your logic here
  categories: any[] = []; // Add this property
}