export class CreateEventDto {
  libraryId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
}
