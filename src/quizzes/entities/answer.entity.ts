import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Question } from './question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  statement: string;

  @Column()
  isCorrect: boolean;

  @ManyToOne((type) => Question, (question) => question.answers, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  question: Question;
}
