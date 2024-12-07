import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { Repository, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from '../event.entity';
import { User } from '../user.entity';

describe('EventService', () => {
  let service: EventService;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const eventData: Partial<Event> = {
        title: 'New Event',
        status: 'TODO',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T12:00:00Z'),
        invitees: [{ id: 1 } as User, { id: 2 } as User],
      };

      const creator = { id: 1, name: 'John Doe' } as User;
      const savedEvent = { id: 1, ...eventData, creator } as Event;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(creator);
      jest.spyOn(userRepository, 'findBy').mockResolvedValue(eventData.invitees as User[]);
      jest.spyOn(eventRepository, 'create').mockImplementation((data) => ({ ...data } as Event));
      jest.spyOn(eventRepository, 'save').mockResolvedValue(savedEvent);

      const result = await service.create(eventData, creator.id);

      expect(result).toEqual(savedEvent);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: creator.id } });
      expect(userRepository.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
      expect(eventRepository.save).toHaveBeenCalledWith({
        ...eventData,
        creator,
        invitees: eventData.invitees,
      });
    });
  });

  describe('mergeAllOverlappingEvents', () => {
    it('should merge overlapping events for a user', async () => {
      const userId = 1;
      const event1 = {
        id: 1,
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        invitees: [],
      } as Event;

      const event2 = {
        id: 2,
        startTime: new Date('2024-01-01T10:30:00Z'),
        endTime: new Date('2024-01-01T11:30:00Z'),
        invitees: [],
      } as Event;

      const mergedEvent = {
        ...event1,
        endTime: new Date('2024-01-01T11:30:00Z'),
        invitees: [],
      } as Event;

      jest.spyOn(eventRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([event1, event2]),
      } as any);

      jest.spyOn(eventRepository, 'save').mockResolvedValue(mergedEvent);
      jest.spyOn(eventRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.mergeAllOverlappingEvents(userId);

      expect(result).toHaveLength(1);
      expect(result[0].endTime).toEqual(new Date('2024-01-01T11:30:00Z'));
    });
  });
});
