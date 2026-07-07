export interface ScrapedEvent {
  title: string;
  description?: string;
  date: string;
  end_date?: string;
  time?: string;
  time_period?: string;
  location?: string;
  city: string;
  province: string;
  category_id: string;
  image_url?: string;
  source_url: string;
  source_name: string;
}
