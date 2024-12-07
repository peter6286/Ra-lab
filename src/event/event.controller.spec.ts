import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from '../event.entity';
import { User } from '../user.entity';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            mergeAllOverlappingEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const eventData: Partial<Event> = {
        title: 'New Event',
        status: 'TODO',
        creator: 1 as unknown as User, // Cast number as User to match Event type
      };

      const strippedEventData: Partial<Event> = {
        title: 'New Event',
        status: 'TODO',
      };

      const creatorId = 1;
      const createdEvent = { id: 1, ...strippedEventData, creator: { id: creatorId, name: 'John Doe' } } as Event;

      jest.spyOn(service, 'create').mockResolvedValue(createdEvent);

      const result = await controller.createEvent(eventData);

      expect(result).toEqual(createdEvent);
      expect(service.create).toHaveBeenCalledWith(strippedEventData, creatorId);
    });

    it('should throw an error if creatorId is not a number', async () => {
      const eventData: Partial<Event> = {
        title: 'Invalid Event',
        status: 'TODO',
        creator: 'InvalidCreatorId' as unknown as User, // Cast invalid data to match type
      };

      await expect(controller.createEvent(eventData)).rejects.toThrow('Valid creatorId is required');
    });

    it('should throw an error if creatorId is undefined', async () => {
      const eventData: Partial<Event> = {
        title: 'Invalid Event',
        status: 'TODO',
      };

      await expect(controller.createEvent(eventData)).rejects.toThrow('Valid creatorId is required');
    });
  });

  describe('getEvent', () => {
    it('should return an event by ID', async () => {
      const eventId = 1;
      const event = { id: eventId, title: 'Test Event' } as Event;

      jest.spyOn(service, 'findOne').mockResolvedValue(event);

      const result = await controller.getEvent(eventId);

      expect(result).toEqual(event);
      expect(service.findOne).toHaveBeenCalledWith(eventId);
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      const events = [
        { id: 1, title: 'Event 1' } as Event,
        { id: 2, title: 'Event 2' } as Event,
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(events);

      const result = await controller.getAllEvents();

      expect(result).toEqual(events);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('updateEvent', () => {
    it('should update an event by ID', async () => {
      const eventId = 1;
      const updateData = { title: 'Updated Event', status: 'IN_PROGRESS' as 'IN_PROGRESS' };
      const updatedEvent = { id: eventId, ...updateData } as Event;

      jest.spyOn(service, 'update').mockResolvedValue(updatedEvent);

      const result = await controller.updateEvent(eventId, updateData);

      expect(result).toEqual(updatedEvent);
      expect(service.update).toHaveBeenCalledWith(eventId, updateData);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event by ID', async () => {
      const eventId = 1;

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.deleteEvent(eventId);

      expect(service.remove).toHaveBeenCalledWith(eventId);
    });
  });

  describe('mergeEventsForUser', () => {
    it('should merge overlapping events for a user', async () => {
      const userId = 1;
      const mergedEvents = [
        { id: 1, title: 'Merged Event 1', status: 'IN_PROGRESS' } as Event,
      ];

      jest.spyOn(service, 'mergeAllOverlappingEvents').mockResolvedValue(mergedEvents);

      const result = await controller.mergeEventsForUser(userId);

      expect(result).toEqual(mergedEvents);
      expect(service.mergeAllOverlappingEvents).toHaveBeenCalledWith(userId);
    });
  });
});
