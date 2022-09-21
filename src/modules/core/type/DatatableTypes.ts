export enum Joins {
  LEFT_JOIN_AND_SELECT = 'leftJoinAndSelect',
  INNER_JOIN_AND_SELECT = 'innerJoinAndSelect',
}

export interface TableJoinOptions {
  type: Joins;
  joinTable: string;
  alias: string;
}
