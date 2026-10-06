import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type CurrencyMode = 'USD' | 'ARS';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private currencySubject = new BehaviorSubject<CurrencyMode>(this.getStoredCurrency());
  currency$: Observable<CurrencyMode> = this.currencySubject.asObservable();

  // Tasa de cambio aproximada USD -> ARS
  private exchangeRate = 1200;

  private getStoredCurrency(): CurrencyMode {
    const saved = localStorage.getItem('app_currency');
    return (saved === 'ARS' || saved === 'USD') ? saved : 'USD';
  }

  get currentCurrency(): CurrencyMode {
    return this.currencySubject.value;
  }

  setCurrency(mode: CurrencyMode): void {
    localStorage.setItem('app_currency', mode);
    this.currencySubject.next(mode);
  }

  format(priceInUsd: number, mode?: CurrencyMode): string {
    const selectedMode = mode || this.currentCurrency;
    if (selectedMode === 'ARS') {
      const priceArs = Math.round(priceInUsd * this.exchangeRate);
      return `$ ${priceArs.toLocaleString('es-AR')} ARS`;
    }
    return `$ ${priceInUsd.toFixed(2)} USD`;
  }
}
