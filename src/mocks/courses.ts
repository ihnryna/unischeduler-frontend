import type {Course} from '../types/catalog'

export const mockCourses: Course[] = [
    {id: 'course-pps', code: 'PPS', title: 'Проєктування програмних систем', teacher: 'В. Бублик', color: 'purple'},
    {id: 'course-se', code: 'SE', title: 'Інженерія програмного забезпечення', teacher: 'О. Петренко', color: 'mint'},
    {id: 'course-cpp', code: 'CPP', title: 'Сучасний C++', teacher: 'В. Бублик', color: 'peach'},
    {id: 'course-db', code: 'DB', title: 'Бази даних', teacher: 'І. Коваль', color: 'purple'},
    {id: 'course-net', code: 'NET', title: 'Комп’ютерні мережі', teacher: 'М. Савчук', color: 'blue'},
    {id: 'course-project', code: 'UNI', title: 'Проєкт UNIScheduler', teacher: 'Команда', color: 'mint'},
    {id: 'course-en', code: 'EN', title: 'Англійська мова', teacher: 'N. Smith', color: 'peach'},
    {id: 'course-algo', code: 'ALG', title: 'Алгоритми та структури даних', teacher: 'А. Мельник', color: 'purple'},
    {id: 'course-qa', code: 'QA', title: 'Тестування програмного забезпечення', teacher: 'О. Петренко', color: 'blue'},
    {id: 'course-arch', code: 'ARCH', title: 'Архітектура програмного забезпечення', teacher: 'І. Коваль', color: 'mint'},
    {id: 'course-self', code: 'SELF', title: 'Самостійна робота', teacher: '—', color: 'peach'},
]
