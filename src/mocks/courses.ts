import type {Course} from '../types/catalog'
import {mockSpecialities} from './specialities'

export const mockCourses: Course[] = [
    'Проєктування програмних систем',
    'Інженерія програмного забезпечення',
    'Сучасний C++',
    'Бази даних',
    'Комп’ютерні мережі',
    'Проєкт UNIScheduler',
    'Англійська мова',
    'Алгоритми та структури даних',
    'Тестування програмного забезпечення',
    'Архітектура програмного забезпечення',
    'Самостійна робота',
].map((name, index) => ({
    id: index + 1,
    name,
    faculty: 'Факультет інформатики',
    department: 'Кафедра мережних технологій',
    semester: 'AUTUMN',
    year: 2026,
    specialities: mockSpecialities,
}))
