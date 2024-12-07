import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'enum', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] })
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp' })
    endTime: Date;

    @ManyToMany(() => User, user => user.invitedEvents)
    @JoinTable()
    invitees: User[];

    @ManyToOne(() => User, (user) => user.createdEvents)
    creator: User;


}

export default Event;
