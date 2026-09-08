import { Injectable } from '@nestjs/common';
import { Subject, Observable, interval, merge, map } from 'rxjs';

const HEARTBEAT_INTERVAL_MS = 15000;

export interface SseMessage {
  type: string;
  data: string;
}

@Injectable()
export class SseService {
  private events = new Subject<SseMessage>();

  emit(event: string, data: unknown) {
    this.events.next({ type: event, data: JSON.stringify(data) });
  }

  getEvents(): Observable<SseMessage> {
    const heartbeat = interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => ({ type: 'heartbeat', data: 'keep-alive' })),
    );
    return merge(this.events.asObservable(), heartbeat);
  }
}
