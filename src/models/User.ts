export enum Group {
    ADMINS = 'ADMINS',
    CURATORS = 'CURATORS',
    RESEARCHERS = 'RESEARCHERS',
}

export interface User {
    username: string;
    email: string,
    groups: Group[],
}