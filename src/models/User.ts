export enum Group {
    ADMINS = 'Admin',
    CURATORS = 'Curator',
    RESEARCHERS = 'Researcher',
}

export interface User {
    username: string;
    email: string,
    groups: Group[],
}