import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Event, event => event.creator)
    createdEvents: Event[];

    @ManyToMany(() => Event, event => event.invitees)
    invitedEvents: Event[];
}

export default User;
