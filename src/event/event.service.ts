import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from '../event.entity';
import { User } from '../user.entity';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(eventData: Partial<Event>, creatorId: number): Promise<Event> {
        console.log('Creating a new event with data:', eventData);

        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new NotFoundException(`User with ID ${creatorId} not found`);
        }

        let invitees = [];
        if (eventData.invitees && eventData.invitees.length > 0) {
            invitees = await this.userRepository.findBy({
                id: In(eventData.invitees.map(invitee => invitee.id)),
            });

            if (invitees.length !== eventData.invitees.length) {
                throw new NotFoundException('One or more invitees not found');
            }
        }

        const event = this.eventRepository.create({
            ...eventData,
            creator,
            invitees,
        });

        const savedEvent = await this.eventRepository.save(event);
        console.log('Event created:', savedEvent);

        return savedEvent;
    }

    async findOne(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['creator', 'invitees'],
        });

        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }

        return event;
    }

    async findAll(): Promise<Event[]> {
        return this.eventRepository.find({
            relations: ['creator', 'invitees'],
        });
    }

    async update(id: number, updateData: Partial<Event>): Promise<Event> {
        await this.eventRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const result = await this.eventRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
    }

    async mergeAllOverlappingEvents(userId: number): Promise<Event[]> {
        const events = await this.eventRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.creator', 'creator')
            .leftJoinAndSelect('event.invitees', 'invitees')
            .where('creator.id = :userId', { userId })
            .orderBy('event.startTime', 'ASC')
            .getMany();

        console.log('Events fetched for merging:', events);

        const mergedEvents: Event[] = [];
        let currentMergedEvent = null;

        for (const event of events) {
            if (currentMergedEvent && this.isOverlapping(currentMergedEvent, event)) {
                console.log('Overlapping found between events:', currentMergedEvent, event);
                currentMergedEvent = this.mergeEvents(currentMergedEvent, event);
                console.log('Result of merging:', currentMergedEvent);
            } else {
                if (currentMergedEvent) {
                    mergedEvents.push(currentMergedEvent);
                }
                currentMergedEvent = event;
            }
        }

        if (currentMergedEvent) {
            mergedEvents.push(currentMergedEvent);
        }

        console.log('Final merged events:', mergedEvents);

        await this.eventRepository.save(mergedEvents);
        await this.removeOriginalEvents(events, mergedEvents);

        return mergedEvents;
    }

    private isOverlapping(event1: Event, event2: Event): boolean {
        return event1.endTime > event2.startTime && event1.startTime < event2.endTime;
    }

    private mergeEvents(event1: Event, event2: Event): Event {
        return {
            ...event1,
            startTime: new Date(Math.min(event1.startTime.getTime(), event2.startTime.getTime())),
            endTime: new Date(Math.max(event1.endTime.getTime(), event2.endTime.getTime())),
            title: `${event1.title}, ${event2.title}`,
            description: `${event1.description || ''} ${event2.description || ''}`.trim(),
            status: 'IN_PROGRESS',
            invitees: Array.from(new Set([...event1.invitees, ...event2.invitees])),
        } as Event;
    }

    private async removeOriginalEvents(originalEvents: Event[], mergedEvents: Event[]): Promise<void> {
        const mergedEventIds = new Set(mergedEvents.map(event => event.id));
        const eventsToDelete = originalEvents
            .filter(event => !mergedEventIds.has(event.id))
            .map(event => event.id);

        if (eventsToDelete.length > 0) {
            await this.eventRepository.delete(eventsToDelete);
            console.log('Deleted original events that were replaced:', eventsToDelete);
        }
    }
}
