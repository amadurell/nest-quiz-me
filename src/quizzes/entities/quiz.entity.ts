import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @JoinTable()
  @OneToMany((type) => Question, (question) => question.quiz, {
    cascade: true,
    eager: true,
  })
  questions: Question[];
}
