import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Answer } from './answer.entity';
import { Quiz } from './quiz.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  statement: string;

  @JoinTable()
  @OneToMany((type) => Answer, (answer) => answer.question, {
    cascade: true,
    eager: true,
  })
  answers: Answer[];

  @ManyToOne((type) => Quiz, (quiz) => quiz.questions, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  quiz: Quiz;
}
