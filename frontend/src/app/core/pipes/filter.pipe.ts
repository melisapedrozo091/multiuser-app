import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform<T extends Record<string, any>>(items: T[] | null, searchText: string, fields: string[]): T[] {
    if (!items || !searchText || !fields || fields.length === 0) {
      return items || [];
    }

    const query = searchText.toLowerCase().trim();

    return items.filter(item => {
      return fields.some(field => {
        const val = item[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }
}
