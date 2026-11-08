import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TICKETS_URL } from './tokens';

interface TicketEntry {
  id: string;
  eventId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly ticketsUrl = inject(TICKETS_URL);

  private readonly ticketIds = signal<string[]>([]);

  readonly count = computed(() => this.ticketIds().length);

  constructor() {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.http.get<TicketEntry[]>(this.ticketsUrl).subscribe({
      next: (data) => {
        const ids = data.map((t) => t.eventId);
        this.ticketIds.set(ids);
      },
      error: () => {},
    });
  }

  addTicket(eventId: string) {
    const previousIds = this.ticketIds();

    this.ticketIds.update((ids) => [...ids, eventId]);

    this.http.post(this.ticketsUrl + 'sdf', { eventId }).subscribe({
      next: () => console.log('Optimistic update successful!'),
      error: (err) => {
        console.log('Sync failed for ', eventId);
        this.ticketIds.set(previousIds);
      },
    });
  }
}
