import { ISkill } from './ISkill';

export interface IEmployee {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    contactPreference: string;
    skills: ISkill[];
}