import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@env/environment';

/** SupabaseService — creates and exposes the single Supabase client instance used app-wide. */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /** The shared Supabase client — use this to build queries (`.from(...)`) or call `.auth`. */
  get db(): SupabaseClient {
    return this.client;
  }
}
