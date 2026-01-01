import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      // Adjust properties you want to search
      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText)
      );
    });
  }
}
