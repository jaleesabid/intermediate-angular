import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from './store-features/request-status.feature';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TICKETS_URL } from './tokens';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { TicketEntry } from './cart.service';
import { tapResponse } from '@ngrx/operators';

type CartState = {
  ticketIds: string[];
};

export const CartStore = signalStore(
  { providedIn: 'root' },

  withState<CartState>({
    ticketIds: [],
  }),
  withComputed(({ ticketIds }) => ({
    count: () => ticketIds().length,
  })),
  withRequestStatus(),
  withMethods((store) => {
    const http = inject(HttpClient);
    const ticketsUrl = inject(TICKETS_URL);

    return {
      _load: rxMethod<void>(
        pipe(
          // optimistically updating state
          tap(() => {
            patchState(store, setPending());
          }),
          switchMap(() =>
            http.get<TicketEntry[]>(ticketsUrl).pipe(
              tapResponse({
                next: (tickets) => {
                  patchState(store, { ticketIds: tickets.map((t) => t.eventId) }, setFulfilled());
                },
                error: (err: { message: string }) => {
                  patchState(store, setError(err.message));
                },
              }),
            ),
          ),
        ),
      ),
      addToCart: rxMethod<{ eventId: string }>(
        exhaustMap(({ eventId }) => {
          // optimistically updating state
          patchState(
            store,
            (state) => ({
              ticketIds: [...state.ticketIds, eventId],
            }),
            setPending(),
          );
          return http.post<void>(ticketsUrl, { eventId }).pipe(
            tapResponse({
              next: () => {
                patchState(store, setFulfilled());
              },
              error: (err: { message: string }) => {
                patchState(
                  store,
                  (state) => {
                    const index = state.ticketIds.lastIndexOf(eventId);
                    if (index === -1) return state;

                    const newIds = [...state.ticketIds];
                    newIds.splice(index, 1);
                    return { ticketIds: newIds };
                  },
                  setError(err.message),
                );
              },
            }),
          );
        }),
      ),
    };
  }),
  withHooks({
    onInit(store) {
      // Automatically load data when the store is first injected
      store._load();
    },
  }),
);
