import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from '../event.entity';
import { User } from '../user.entity';


@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) {}
    

    @Post()
async createEvent(@Body() eventData: Partial<Event>): Promise<Event> {
    const creatorId = Number(eventData.creator); // Convert creatorId to number
    delete eventData.creator; // Remove creatorId from eventData to avoid conflicts

    console.log('Creating event with data:', eventData, 'and creatorId:', creatorId);

    if (isNaN(creatorId)) {
        throw new Error('Valid creatorId is required');
    }

    try {
        const event = await this.eventService.create(eventData, creatorId);
        console.log('Event created successfully:', event);
        return event;
    } catch (error) {
        console.error('Error creating event:', error.message);
        throw error;
    }
}
    

    @Get(':id')
    async getEvent(@Param('id') id: number): Promise<Event> {
        return this.eventService.findOne(id);
    }

    @Get()
    async getAllEvents(): Promise<Event[]> {
        return this.eventService.findAll();
    }

    @Patch(':id')
    async updateEvent(@Param('id') id: number, @Body() updateData: Partial<Event>): Promise<Event> {
        return this.eventService.update(id, updateData);
    }

    @Delete(':id')
    async deleteEvent(@Param('id') id: number): Promise<void> {
        await this.eventService.remove(id);
    }

    @Get('merge/:userId')
    async mergeEventsForUser(@Param('userId') userId: number) {
        const mergedEvents = await this.eventService.mergeAllOverlappingEvents(userId);
        return mergedEvents;
    }
}
