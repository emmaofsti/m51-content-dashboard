export interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
  imageUrl?: string;
  stats: {
    delivered: number;
    target: number;
    streak: number;
    published: number;
  };
}

export const employees: Employee[] = [
  {
    id: 1,
    name: 'Asgeir',
    role: '',
    email: 'asgeir@m51.no',
    stats: {
      delivered: 2,
      target: 1,
      streak: 0,
      published: 3
    }
  },
  {
    id: 2,
    name: 'Daniel',
    role: '',
    email: 'daniel@m51.no',
    stats: {
      delivered: 1,
      target: 1,
      streak: 0,
      published: 1
    }
  },
  {
    id: 3,
    name: 'Eirik',
    role: '',
    email: 'eirik@m51.no',
    stats: {
      delivered: 0,
      target: 1,
      streak: 0,
      published: 0
    }
  },
  {
    id: 4,
    name: 'Elisabeth',
    role: '',
    email: 'elisabeth@m51.no',
    stats: {
      delivered: 2,
      target: 1,
      streak: 0,
      published: 2
    }
  },
  {
    id: 5,
    name: 'Jonathan',
    role: '',
    email: 'jonathan@m51.no',
    stats: {
      delivered: 1,
      target: 1,
      streak: 0,
      published: 0
    }
  },
  {
    id: 7,
    name: 'Mathias',
    role: '',
    email: 'mathias@m51.no',
    stats: {
      delivered: 0,
      target: 1,
      streak: 0,
      published: 0
    }
  },
  {
    id: 6,
    name: 'Emma',
    role: 'Tech Lead',
    email: 'emma@m51.no',
    stats: {
      delivered: 3,
      target: 1,
      streak: 0,
      published: 4
    }
  },
];
