import { Pipe, PipeTransform } from '@angular/core';

/** 12000 → "¥12,000"   Usage: {{ price | yen }} */
@Pipe({ name: 'yen', standalone: true })
export class YenPipe implements PipeTransform {
  private static readonly formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JPY',
  });

  transform(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : YenPipe.formatter.format(value);
  }
}
